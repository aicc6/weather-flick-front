/**
 * 중복 알림 정리 유틸리티
 */

import {
  getScheduledNotifications,
  removeScheduledNotification,
} from './notificationStorage'
import { cancelScheduledNotification } from './notificationUtils'

/**
 * 중복된 알림들을 정리
 */
export const cleanupDuplicateNotifications = (planId = null) => {
  const notifications = getScheduledNotifications(planId)

  // 경로별로 그룹화
  const groupedByRoute = {}

  notifications.forEach((notification) => {
    const key = `${notification.routeId}_${notification.type}`
    if (!groupedByRoute[key]) {
      groupedByRoute[key] = []
    }
    groupedByRoute[key].push(notification)
  })

  let removedCount = 0

  // 각 그룹에서 최신 것만 남기고 나머지 제거
  Object.keys(groupedByRoute).forEach((key) => {
    const group = groupedByRoute[key]
    if (group.length > 1) {
      // 생성 시간 기준으로 정렬 (최신 순)
      group.sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
      )

      // 첫 번째(최신) 것을 제외하고 나머지 모두 제거
      for (let i = 1; i < group.length; i++) {
        const notification = group[i]
        cancelScheduledNotification(notification.id)
        removeScheduledNotification(notification.id)
        removedCount++
      }
    }
  })

  return removedCount
}

/**
 * 만료된 알림들 정리
 */
export const cleanupExpiredNotifications = (planId = null) => {
  const notifications = getScheduledNotifications(planId)
  const now = new Date()
  let removedCount = 0

  notifications.forEach((notification) => {
    const scheduledTime = new Date(notification.scheduledTime)
    // 스케줄된 시간이 지난 알림들 제거
    if (scheduledTime < now) {
      cancelScheduledNotification(notification.id)
      removeScheduledNotification(notification.id)
      removedCount++
    }
  })

  return removedCount
}

/**
 * 모든 알림 정리 (중복 + 만료)
 */
export const cleanupAllNotifications = (planId = null) => {
  const duplicateCount = cleanupDuplicateNotifications(planId)
  const expiredCount = cleanupExpiredNotifications(planId)

  return {
    duplicateCount,
    expiredCount,
    totalRemoved: duplicateCount + expiredCount,
  }
}

export default {
  cleanupDuplicateNotifications,
  cleanupExpiredNotifications,
  cleanupAllNotifications,
}
