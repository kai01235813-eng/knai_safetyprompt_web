"""
AI 프롬프트 보안 검증 이력 로깅 시스템
SQLite 기반 검증 이력 저장 및 조회

보안성검토 체크리스트 ⑥ AI시스템 로깅·모니터링 대응
- 사용자 요청·응답 및 접속이력 로그 기록
- 비정상 입력 패턴 탐지·분석 지원
"""

import sqlite3
import json
import os
import hashlib
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from contextlib import contextmanager


# DB 파일 경로 (환경변수 또는 기본값)
DB_PATH = os.getenv("AUDIT_LOG_DB", os.path.join(os.path.dirname(__file__), "..", "data", "audit_log.db"))
LOG_RETENTION_DAYS = int(os.getenv("LOG_RETENTION_DAYS", "90"))


@contextmanager
def get_db():
    """SQLite 연결 컨텍스트 매니저"""
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """DB 테이블 초기화"""
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS validation_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
                session_id TEXT,
                input_type TEXT NOT NULL DEFAULT 'text',
                prompt_hash TEXT NOT NULL,
                prompt_length INTEGER NOT NULL,
                security_level TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                is_safe INTEGER NOT NULL,
                violation_count INTEGER NOT NULL DEFAULT 0,
                violation_types TEXT,
                violation_details TEXT,
                regulation_refs TEXT,
                client_ip TEXT,
                user_agent TEXT,
                response_time_ms INTEGER
            );

            CREATE TABLE IF NOT EXISTS daily_stats (
                date TEXT PRIMARY KEY,
                total_requests INTEGER NOT NULL DEFAULT 0,
                safe_count INTEGER NOT NULL DEFAULT 0,
                warning_count INTEGER NOT NULL DEFAULT 0,
                danger_count INTEGER NOT NULL DEFAULT 0,
                blocked_count INTEGER NOT NULL DEFAULT 0,
                avg_risk_score REAL NOT NULL DEFAULT 0,
                top_violation_types TEXT
            );

            CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON validation_logs(timestamp);
            CREATE INDEX IF NOT EXISTS idx_logs_security_level ON validation_logs(security_level);
            CREATE INDEX IF NOT EXISTS idx_logs_risk_score ON validation_logs(risk_score);
        """)
    print("✅ Audit log DB initialized:", DB_PATH)


def log_validation(
    prompt: str,
    result: Dict[str, Any],
    input_type: str = "text",
    session_id: str = None,
    client_ip: str = None,
    user_agent: str = None,
    response_time_ms: int = None,
):
    """검증 결과를 DB에 저장"""
    # 프롬프트는 해시로만 저장 (원문 저장 금지 - 보안)
    prompt_hash = hashlib.sha256(prompt.encode()).hexdigest()[:16]

    violations = result.get("violations", [])
    violation_types = list(set(v.get("type", "") for v in violations))
    regulation_refs = result.get("regulation_refs", [])

    with get_db() as conn:
        conn.execute("""
            INSERT INTO validation_logs (
                session_id, input_type, prompt_hash, prompt_length,
                security_level, risk_score, is_safe,
                violation_count, violation_types, violation_details,
                regulation_refs, client_ip, user_agent, response_time_ms
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            input_type,
            prompt_hash,
            len(prompt),
            result.get("security_level", "안전"),
            result.get("risk_score", 0),
            1 if result.get("is_safe", True) else 0,
            len(violations),
            json.dumps(violation_types, ensure_ascii=False),
            json.dumps([
                {"type": v.get("type"), "description": v.get("description"), "severity": v.get("severity")}
                for v in violations
            ], ensure_ascii=False),
            json.dumps([
                {"law": r.get("law"), "article": r.get("article"), "source": r.get("source")}
                for r in regulation_refs
            ], ensure_ascii=False),
            client_ip,
            user_agent,
            response_time_ms,
        ))

    # 일별 통계 업데이트
    _update_daily_stats(result)


def _update_daily_stats(result: Dict[str, Any]):
    """일별 통계 갱신"""
    today = datetime.now().strftime("%Y-%m-%d")
    level = result.get("security_level", "안전")
    risk = result.get("risk_score", 0)

    with get_db() as conn:
        row = conn.execute("SELECT * FROM daily_stats WHERE date = ?", (today,)).fetchone()

        if row:
            total = row["total_requests"] + 1
            new_avg = (row["avg_risk_score"] * row["total_requests"] + risk) / total
            conn.execute("""
                UPDATE daily_stats SET
                    total_requests = ?,
                    safe_count = safe_count + ?,
                    warning_count = warning_count + ?,
                    danger_count = danger_count + ?,
                    blocked_count = blocked_count + ?,
                    avg_risk_score = ?
                WHERE date = ?
            """, (
                total,
                1 if level == "안전" else 0,
                1 if level == "경고" else 0,
                1 if level == "위험" else 0,
                1 if level == "차단" else 0,
                round(new_avg, 1),
                today,
            ))
        else:
            conn.execute("""
                INSERT INTO daily_stats (date, total_requests, safe_count, warning_count, danger_count, blocked_count, avg_risk_score)
                VALUES (?, 1, ?, ?, ?, ?, ?)
            """, (
                today,
                1 if level == "안전" else 0,
                1 if level == "경고" else 0,
                1 if level == "위험" else 0,
                1 if level == "차단" else 0,
                float(risk),
            ))


def get_recent_logs(limit: int = 50, offset: int = 0, level_filter: str = None) -> Dict:
    """최근 검증 이력 조회"""
    with get_db() as conn:
        where = ""
        params: list = []
        if level_filter and level_filter != "all":
            where = "WHERE security_level = ?"
            params.append(level_filter)

        total = conn.execute(f"SELECT COUNT(*) as cnt FROM validation_logs {where}", params).fetchone()["cnt"]

        rows = conn.execute(f"""
            SELECT id, timestamp, input_type, prompt_hash, prompt_length,
                   security_level, risk_score, is_safe, violation_count,
                   violation_types, client_ip, response_time_ms
            FROM validation_logs {where}
            ORDER BY timestamp DESC
            LIMIT ? OFFSET ?
        """, params + [limit, offset]).fetchall()

        return {
            "total": total,
            "limit": limit,
            "offset": offset,
            "logs": [dict(r) for r in rows],
        }


def get_log_detail(log_id: int) -> Optional[Dict]:
    """검증 이력 상세 조회"""
    with get_db() as conn:
        row = conn.execute("SELECT * FROM validation_logs WHERE id = ?", (log_id,)).fetchone()
        if row:
            d = dict(row)
            # JSON 파싱
            for field in ("violation_types", "violation_details", "regulation_refs"):
                if d.get(field):
                    try:
                        d[field] = json.loads(d[field])
                    except (json.JSONDecodeError, TypeError):
                        pass
            return d
        return None


def get_dashboard_stats(days: int = 30) -> Dict:
    """대시보드 통계"""
    since = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

    with get_db() as conn:
        # 전체 요약
        summary = conn.execute("""
            SELECT
                COUNT(*) as total_requests,
                SUM(CASE WHEN security_level = '안전' THEN 1 ELSE 0 END) as safe_count,
                SUM(CASE WHEN security_level = '경고' THEN 1 ELSE 0 END) as warning_count,
                SUM(CASE WHEN security_level = '위험' THEN 1 ELSE 0 END) as danger_count,
                SUM(CASE WHEN security_level = '차단' THEN 1 ELSE 0 END) as blocked_count,
                ROUND(AVG(risk_score), 1) as avg_risk_score,
                MAX(risk_score) as max_risk_score,
                ROUND(AVG(response_time_ms), 0) as avg_response_ms
            FROM validation_logs
            WHERE timestamp >= ?
        """, (since,)).fetchone()

        # 일별 추이
        daily = conn.execute("""
            SELECT * FROM daily_stats
            WHERE date >= ?
            ORDER BY date ASC
        """, (since,)).fetchall()

        # 위반유형 Top 5
        top_violations = conn.execute("""
            SELECT violation_types, COUNT(*) as cnt
            FROM validation_logs
            WHERE timestamp >= ? AND violation_count > 0
            GROUP BY violation_types
            ORDER BY cnt DESC
            LIMIT 10
        """, (since,)).fetchall()

        # 시간대별 분포
        hourly = conn.execute("""
            SELECT
                CAST(strftime('%H', timestamp) AS INTEGER) as hour,
                COUNT(*) as cnt
            FROM validation_logs
            WHERE timestamp >= ?
            GROUP BY hour
            ORDER BY hour
        """, (since,)).fetchall()

        return {
            "period_days": days,
            "summary": dict(summary) if summary else {},
            "daily_trend": [dict(r) for r in daily],
            "top_violations": [dict(r) for r in top_violations],
            "hourly_distribution": [dict(r) for r in hourly],
        }


def cleanup_old_logs():
    """보관기간 초과 로그 삭제"""
    cutoff = (datetime.now() - timedelta(days=LOG_RETENTION_DAYS)).strftime("%Y-%m-%d %H:%M:%S")
    with get_db() as conn:
        deleted = conn.execute("DELETE FROM validation_logs WHERE timestamp < ?", (cutoff,)).rowcount
        conn.execute("DELETE FROM daily_stats WHERE date < ?", (cutoff[:10],))
    if deleted:
        print(f"🗑️ Cleaned up {deleted} logs older than {LOG_RETENTION_DAYS} days")
    return deleted
