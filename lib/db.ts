/**
 * 데이터베이스 연결 및 쿼리 라이브러리
 */

import { PrismaClient } from '@prisma/client'

// Prisma 클라이언트 싱글톤
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * 검증 로그 저장
 */
export async function saveValidationLog(data: {
  originalPrompt: string
  inputType: string
  securityLevel: string
  riskScore: number
  isSafe: boolean
  violations: any[]
  violationCount: number
  sanitizedPrompt: string
  userIp?: string
  userAgent?: string
  sessionId?: string
  userId?: string
  department?: string
  imagePath?: string
  ocrConfidence?: number
}) {
  try {
    const log = await prisma.validationLog.create({
      data: {
        originalPrompt: data.originalPrompt,
        inputType: data.inputType,
        securityLevel: data.securityLevel,
        riskScore: data.riskScore,
        isSafe: data.isSafe,
        violations: data.violations,
        violationCount: data.violationCount,
        sanitizedPrompt: data.sanitizedPrompt,
        userIp: data.userIp,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
        userId: data.userId,
        department: data.department,
        imagePath: data.imagePath,
        ocrConfidence: data.ocrConfidence,
      },
    })

    // 통계 캐시 업데이트 (비동기)
    updateStatisticsCache(data.securityLevel).catch(console.error)

    return log
  } catch (error) {
    console.error('Failed to save validation log:', error)
    throw error
  }
}

/**
 * 통계 캐시 업데이트
 */
async function updateStatisticsCache(securityLevel: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existing = await prisma.statisticsCache.findUnique({
    where: { statDate: today },
  })

  const increment: any = {
    totalValidations: 1,
  }

  switch (securityLevel) {
    case 'SAFE':
      increment.safeCount = 1
      break
    case 'WARNING':
      increment.warningCount = 1
      break
    case 'DANGER':
      increment.dangerCount = 1
      break
    case 'BLOCKED':
      increment.blockedCount = 1
      break
  }

  if (existing) {
    await prisma.statisticsCache.update({
      where: { statDate: today },
      data: {
        totalValidations: { increment: 1 },
        safeCount: { increment: increment.safeCount || 0 },
        warningCount: { increment: increment.warningCount || 0 },
        dangerCount: { increment: increment.dangerCount || 0 },
        blockedCount: { increment: increment.blockedCount || 0 },
      },
    })
  } else {
    await prisma.statisticsCache.create({
      data: {
        statDate: today,
        totalValidations: 1,
        safeCount: increment.safeCount || 0,
        warningCount: increment.warningCount || 0,
        dangerCount: increment.dangerCount || 0,
        blockedCount: increment.blockedCount || 0,
      },
    })
  }
}

/**
 * 로그 조회 (페이지네이션)
 */
export async function getValidationLogs(params: {
  page?: number
  limit?: number
  startDate?: Date
  endDate?: Date
  securityLevel?: string
  searchQuery?: string
}) {
  const {
    page = 1,
    limit = 50,
    startDate,
    endDate,
    securityLevel,
    searchQuery,
  } = params

  const where: any = {}

  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) where.timestamp.gte = startDate
    if (endDate) where.timestamp.lte = endDate
  }

  if (securityLevel) {
    where.securityLevel = securityLevel
  }

  if (searchQuery) {
    where.OR = [
      { originalPrompt: { contains: searchQuery, mode: 'insensitive' } },
      { sanitizedPrompt: { contains: searchQuery, mode: 'insensitive' } },
    ]
  }

  const [total, logs] = await Promise.all([
    prisma.validationLog.count({ where }),
    prisma.validationLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
}

/**
 * 통계 조회
 */
export async function getStatistics(params: {
  startDate?: Date
  endDate?: Date
}) {
  const { startDate, endDate } = params

  const where: any = {}

  if (startDate || endDate) {
    where.timestamp = {}
    if (startDate) where.timestamp.gte = startDate
    if (endDate) where.timestamp.lte = endDate
  }

  // 전체 통계
  const [
    total,
    safeCount,
    warningCount,
    dangerCount,
    blockedCount,
  ] = await Promise.all([
    prisma.validationLog.count({ where }),
    prisma.validationLog.count({ where: { ...where, securityLevel: 'SAFE' } }),
    prisma.validationLog.count({ where: { ...where, securityLevel: 'WARNING' } }),
    prisma.validationLog.count({ where: { ...where, securityLevel: 'DANGER' } }),
    prisma.validationLog.count({ where: { ...where, securityLevel: 'BLOCKED' } }),
  ])

  // Top 위반 유형 (최근 1000개 로그 기준)
  const recentLogs = await prisma.validationLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 1000,
    select: { violations: true },
  })

  const violationTypes: Record<string, number> = {}
  recentLogs.forEach((log) => {
    if (Array.isArray(log.violations)) {
      log.violations.forEach((v: any) => {
        violationTypes[v.type] = (violationTypes[v.type] || 0) + 1
      })
    }
  })

  const topViolations = Object.entries(violationTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([type, count]) => ({ type, count }))

  return {
    total,
    byLevel: {
      safe: safeCount,
      warning: warningCount,
      danger: dangerCount,
      blocked: blockedCount,
    },
    topViolations,
  }
}
