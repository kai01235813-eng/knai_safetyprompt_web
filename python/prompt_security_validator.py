"""
한국전력공사 생성형AI 프롬프트 보안 검증 시스템
외부 AI 서버 전송 전 민감정보 및 보안 위배 사항 탐지/차단
"""

import re
import json
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, asdict
from enum import Enum
from datetime import datetime


class SecurityLevel(Enum):
    """보안 등급"""
    SAFE = "안전"
    WARNING = "경고"
    DANGER = "위험"
    BLOCKED = "차단"


class ViolationType(Enum):
    """위반 유형"""
    PERSONAL_INFO = "개인정보"
    CONFIDENTIAL = "기밀정보"
    TECHNICAL_INFO = "기술정보"
    ORGANIZATION = "조직정보"
    LOCATION = "위치정보"
    FINANCIAL = "재무정보"
    SYSTEM_INFO = "시스템정보"


@dataclass
class SecurityViolation:
    """보안 위반 항목"""
    type: ViolationType
    description: str
    matched_text: str
    position: Tuple[int, int]
    severity: int  # 1-10


@dataclass
class ValidationResult:
    """검증 결과"""
    is_safe: bool
    security_level: SecurityLevel
    risk_score: int
    violations: List[SecurityViolation]
    sanitized_prompt: str
    original_prompt: str
    timestamp: str
    recommendation: str


class KEPCOPromptSecurityValidator:
    """한국전력공사 프롬프트 보안 검증기"""

    def __init__(self):
        self._init_patterns()
        self._init_keywords()
        self._init_rules()

    def _init_patterns(self):
        """정규식 패턴 초기화"""
        self.patterns = {
            # 개인정보 보호법 대상
            '주민등록번호': (
                r'\d{6}[-\s]?[1-4]\d{6}',
                ViolationType.PERSONAL_INFO,
                10
            ),
            '외국인등록번호': (
                r'\d{6}[-\s]?[5-8]\d{6}',
                ViolationType.PERSONAL_INFO,
                10
            ),
            '여권번호': (
                r'[A-Z]{1,2}\d{8,9}',
                ViolationType.PERSONAL_INFO,
                9
            ),
            '운전면허번호': (
                r'(?:\d{2}[-\s]?\d{2}[-\s]?\d{6}[-\s]?\d{2})|(?:[가-힣]+\d{2}-\d{6}-\d{2})',
                ViolationType.PERSONAL_INFO,
                9
            ),
            '신용카드번호': (
                r'\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}',
                ViolationType.PERSONAL_INFO,
                10
            ),
            '계좌번호': (
                r'\d{3,6}[-\s]?\d{2,8}[-\s]?\d{4,}',
                ViolationType.PERSONAL_INFO,
                9
            ),
            '휴대전화번호': (
                r'01[016789][-\s]?\d{3,4}[-\s]?\d{4}',
                ViolationType.PERSONAL_INFO,
                7
            ),
            '일반전화번호': (
                r'0\d{1,2}[-\s]?\d{3,4}[-\s]?\d{4}',
                ViolationType.PERSONAL_INFO,
                6
            ),
            '이메일주소': (
                r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}',
                ViolationType.PERSONAL_INFO,
                7
            ),

            # 보안정보
            'IP주소': (
                r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
                ViolationType.SYSTEM_INFO,
                8
            ),
            'MAC주소': (
                r'(?:[0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}',
                ViolationType.SYSTEM_INFO,
                8
            ),
            'URL경로': (
                r'https?://[^\s]+',
                ViolationType.SYSTEM_INFO,
                6
            ),
            '비밀번호패턴': (
                r'(?:password|passwd|pwd|pass)\s*[:=]\s*\S+',
                ViolationType.SYSTEM_INFO,
                10
            ),
            'API키패턴': (
                r'(?:api[_-]?key|apikey|access[_-]?token)\s*[:=]\s*["\']?[\w-]+["\']?',
                ViolationType.SYSTEM_INFO,
                10
            ),

            # 위치정보
            '상세주소': (
                r'[가-힣]+[시도]\s+[가-힣]+[구군]\s+[가-힣]+[동읍면]\s+\d+[-\d]*',
                ViolationType.LOCATION,
                8
            ),
            '지번주소': (
                r'[가-힣]+[동읍면리]\s+\d+[-\d]*번지',
                ViolationType.LOCATION,
                7
            ),

            # 금액정보
            '구체적금액_억': (
                r'\d{1,}[,\d]*\s*억\s*(?:\d+[,\d]*\s*만\s*)?원',
                ViolationType.FINANCIAL,
                7
            ),
            '구체적금액_원': (
                r'\d{6,}[,\d]*\s*원',
                ViolationType.FINANCIAL,
                6
            ),

            # 전력시스템
            '변전소구체위치': (
                r'[가-힣]+\s*\d*호?\s*변전소',
                ViolationType.TECHNICAL_INFO,
                8
            ),
            '발전소구체위치': (
                r'[가-힣]+\s*화력|원자력|수력\s*발전소',
                ViolationType.TECHNICAL_INFO,
                9
            ),
            '전력량수치': (
                r'\d+\.?\d*\s*(?:kW|MW|GW|kWh|MWh|GWh)',
                ViolationType.TECHNICAL_INFO,
                7
            ),

            # 조직정보
            '임직원명': (
                r'[가-힣]{2,4}\s*(?:사장|부사장|전무|상무|이사|부장|차장|과장|대리|주임)',
                ViolationType.ORGANIZATION,
                8
            ),
            '부서명상세': (
                r'(?:본부|실|부|팀|센터)\s*(?:장\s*)?[가-힣]{2,}',
                ViolationType.ORGANIZATION,
                6
            ),
        }

    def _init_keywords(self):
        """키워드 기반 탐지 목록 초기화"""
        self.keyword_rules = {
            # 기밀등급 키워드
            'confidential_markers': {
                'keywords': [
                    '대외비', '비밀', '극비', '1급비밀', '2급비밀', '3급비밀',
                    'CONFIDENTIAL', 'SECRET', 'TOP SECRET',
                    '내부자료', '사내전용', '열람제한', '배포금지'
                ],
                'type': ViolationType.CONFIDENTIAL,
                'severity': 10
            },

            # 전력 인프라 기술정보
            'power_infrastructure': {
                'keywords': [
                    'SCADA', 'EMS', 'DMS', 'OMS', 'ADMS',
                    '배전자동화', '원격감시', '원격제어',
                    '계통운영', '전력계통', '송배전망',
                    '보호계전', '차단기위치', '개폐기',
                    'KEPCO-NET', 'KDN시스템'
                ],
                'type': ViolationType.TECHNICAL_INFO,
                'severity': 9
            },

            # 보안시스템
            'security_systems': {
                'keywords': [
                    '방화벽', 'firewall', 'IPS', 'IDS',
                    'VPN설정', 'ACL', '접근통제',
                    '인증서버', 'Active Directory', 'LDAP',
                    '백업서버', 'DB서버', '운영서버'
                ],
                'type': ViolationType.SYSTEM_INFO,
                'severity': 9
            },

            # 경영정보
            'management_info': {
                'keywords': [
                    '입찰정보', '낙찰가', '계약금액', '견적서',
                    '경영전략', '사업계획', '투자계획',
                    '인사평가', '급여', '성과급', '인센티브',
                    '재무제표', '손익계산서', '대차대조표'
                ],
                'type': ViolationType.CONFIDENTIAL,
                'severity': 9
            },

            # 고객정보
            'customer_info': {
                'keywords': [
                    '고객명단', '수용가정보', '계약정보',
                    '전력사용량', '요금정보', '미납정보',
                    '고객DB', 'CRM시스템'
                ],
                'type': ViolationType.PERSONAL_INFO,
                'severity': 10
            },

            # 시스템 접근정보
            'access_info': {
                'keywords': [
                    '관리자권한', 'root', 'administrator',
                    '마스터키', '인증키', '암호화키',
                    '토큰', 'session', 'cookie값'
                ],
                'type': ViolationType.SYSTEM_INFO,
                'severity': 10
            }
        }

    def _init_rules(self):
        """검증 규칙 초기화"""
        # 위험도 점수 임계값
        self.thresholds = {
            SecurityLevel.SAFE: 0,
            SecurityLevel.WARNING: 15,
            SecurityLevel.DANGER: 40,
            SecurityLevel.BLOCKED: 60
        }

    def _find_pattern_violations(self, text: str) -> List[SecurityViolation]:
        """패턴 기반 위반사항 탐지"""
        violations = []

        for pattern_name, (regex, vtype, severity) in self.patterns.items():
            matches = re.finditer(regex, text, re.IGNORECASE)
            for match in matches:
                violations.append(SecurityViolation(
                    type=vtype,
                    description=f"{pattern_name} 탐지",
                    matched_text=match.group(),
                    position=(match.start(), match.end()),
                    severity=severity
                ))

        return violations

    def _find_keyword_violations(self, text: str) -> List[SecurityViolation]:
        """키워드 기반 위반사항 탐지"""
        violations = []
        text_lower = text.lower()

        for rule_name, rule in self.keyword_rules.items():
            for keyword in rule['keywords']:
                keyword_lower = keyword.lower()
                pos = 0
                while True:
                    idx = text_lower.find(keyword_lower, pos)
                    if idx == -1:
                        break

                    violations.append(SecurityViolation(
                        type=rule['type'],
                        description=f"{rule_name}: '{keyword}' 키워드 발견",
                        matched_text=text[idx:idx+len(keyword)],
                        position=(idx, idx+len(keyword)),
                        severity=rule['severity']
                    ))
                    pos = idx + 1

        return violations

    def _calculate_risk_score(self, violations: List[SecurityViolation]) -> int:
        """위험도 점수 계산"""
        if not violations:
            return 0

        # 심각도 합계
        total_severity = sum(v.severity for v in violations)

        # 위반 유형별 가중치
        type_weights = {
            ViolationType.PERSONAL_INFO: 1.5,
            ViolationType.CONFIDENTIAL: 1.4,
            ViolationType.SYSTEM_INFO: 1.3,
            ViolationType.TECHNICAL_INFO: 1.2,
            ViolationType.FINANCIAL: 1.1,
            ViolationType.ORGANIZATION: 1.0,
            ViolationType.LOCATION: 1.0,
        }

        weighted_score = sum(
            v.severity * type_weights.get(v.type, 1.0)
            for v in violations
        )

        # 위반 건수에 따른 추가 점수
        count_penalty = min(len(violations) * 2, 20)

        return min(int(weighted_score + count_penalty), 100)

    def _determine_security_level(self, risk_score: int) -> SecurityLevel:
        """보안 등급 결정"""
        if risk_score >= self.thresholds[SecurityLevel.BLOCKED]:
            return SecurityLevel.BLOCKED
        elif risk_score >= self.thresholds[SecurityLevel.DANGER]:
            return SecurityLevel.DANGER
        elif risk_score >= self.thresholds[SecurityLevel.WARNING]:
            return SecurityLevel.WARNING
        else:
            return SecurityLevel.SAFE

    def _sanitize_prompt(self, text: str, violations: List[SecurityViolation]) -> str:
        """민감정보 마스킹 처리"""
        sanitized = text

        # 위치 기준 역순 정렬 (뒤에서부터 치환)
        sorted_violations = sorted(
            violations,
            key=lambda v: v.position[0],
            reverse=True
        )

        for violation in sorted_violations:
            start, end = violation.position
            # 간단한 별표 마스킹 처리
            mask = "***"
            sanitized = sanitized[:start] + mask + sanitized[end:]

        return sanitized

    def _generate_recommendation(self, level: SecurityLevel, violations: List[SecurityViolation]) -> str:
        """권장사항 생성"""
        if level == SecurityLevel.SAFE:
            return "프롬프트를 안전하게 사용할 수 있습니다."

        recommendations = []

        if level == SecurityLevel.BLOCKED:
            recommendations.append("⛔ 전송 차단: 심각한 보안 위반이 탐지되었습니다.")
        elif level == SecurityLevel.DANGER:
            recommendations.append("⚠️ 전송 위험: 중대한 보안 문제가 있습니다.")
        else:
            recommendations.append("⚡ 주의 필요: 보안 위험 요소가 있습니다.")

        # 위반 유형별 그룹화
        type_counts = {}
        for v in violations:
            type_counts[v.type] = type_counts.get(v.type, 0) + 1

        recommendations.append(f"\n탐지된 위반사항: 총 {len(violations)}건")
        for vtype, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
            recommendations.append(f"  - {vtype.value}: {count}건")

        recommendations.append("\n조치방법:")
        recommendations.append("1. 프롬프트에서 민감정보를 제거하세요")
        recommendations.append("2. 일반화된 표현으로 수정하세요")
        recommendations.append("3. 예시 데이터는 가상의 값을 사용하세요")

        return "\n".join(recommendations)

    def validate(self, prompt: str) -> ValidationResult:
        """프롬프트 보안 검증 실행"""
        # 위반사항 탐지
        pattern_violations = self._find_pattern_violations(prompt)
        keyword_violations = self._find_keyword_violations(prompt)
        all_violations = pattern_violations + keyword_violations

        # 위험도 평가
        risk_score = self._calculate_risk_score(all_violations)
        security_level = self._determine_security_level(risk_score)

        # 안전 여부
        is_safe = security_level == SecurityLevel.SAFE

        # 마스킹 처리
        sanitized = self._sanitize_prompt(prompt, all_violations)

        # 권장사항
        recommendation = self._generate_recommendation(security_level, all_violations)

        return ValidationResult(
            is_safe=is_safe,
            security_level=security_level,
            risk_score=risk_score,
            violations=all_violations,
            sanitized_prompt=sanitized,
            original_prompt=prompt,
            timestamp=datetime.now().isoformat(),
            recommendation=recommendation
        )

    def save_log(self, result: ValidationResult, filepath: str = "security_log.json"):
        """검증 결과 로그 저장"""
        log_entry = {
            'timestamp': result.timestamp,
            'security_level': result.security_level.value,
            'risk_score': result.risk_score,
            'is_safe': result.is_safe,
            'violation_count': len(result.violations),
            'violations': [
                {
                    'type': v.type.value,
                    'description': v.description,
                    'severity': v.severity
                }
                for v in result.violations
            ]
        }

        try:
            # 기존 로그 읽기
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    logs = json.load(f)
            except FileNotFoundError:
                logs = []

            logs.append(log_entry)

            # 로그 저장
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(logs, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"로그 저장 실패: {e}")


def print_validation_result(result: ValidationResult):
    """검증 결과 출력"""
    print("=" * 80)
    print("한국전력공사 프롬프트 보안 검증 결과")
    print("=" * 80)
    print(f"검증 시각: {result.timestamp}")
    print(f"보안 등급: {result.security_level.value}")
    print(f"위험 점수: {result.risk_score}/100")
    print(f"안전 여부: {'✅ 안전' if result.is_safe else '❌ 위험'}")
    print("-" * 80)

    if result.violations:
        print(f"\n탐지된 보안 위반사항 ({len(result.violations)}건):")
        for i, violation in enumerate(result.violations, 1):
            print(f"{i}. [{violation.type.value}] {violation.description}")
            print(f"   탐지 내용: {violation.matched_text}")
            print(f"   심각도: {violation.severity}/10")

        print(f"\n마스킹 처리된 프롬프트:")
        print(f"{result.sanitized_prompt}")

    print("\n" + "-" * 80)
    print(result.recommendation)
    print("=" * 80)


def main():
    """테스트 실행"""
    validator = KEPCOPromptSecurityValidator()

    # 테스트 케이스
    test_cases = [
        # 안전한 케이스
        "전력 수요 예측 모델을 만들고 싶습니다. 일반적인 방법을 알려주세요.",

        # 경고 케이스
        "우리 회사 변전소의 효율을 개선하려고 합니다. 일반적인 조언 부탁합니다.",

        # 위험 케이스
        "김철수 부장(010-1234-5678)에게 대외비 자료를 전달했습니다.",

        # 차단 케이스
        "SCADA 시스템 IP주소 192.168.1.100, 관리자 비밀번호는 admin1234입니다. "
        "홍길동 사장님의 주민번호 650101-1234567로 승인받았습니다.",

        # 복합 케이스
        "서울 강남구 역삼동 123-45 한국전력 3호 변전소의 전력량 500MW 데이터를 "
        "분석해주세요. 계약금액 50억원입니다."
    ]

    for i, test_prompt in enumerate(test_cases, 1):
        print(f"\n\n{'='*80}")
        print(f"테스트 케이스 {i}")
        print(f"{'='*80}")
        print(f"입력 프롬프트:\n{test_prompt}\n")

        result = validator.validate(test_prompt)
        print_validation_result(result)

        # 로그 저장
        validator.save_log(result)


if __name__ == "__main__":
    main()
