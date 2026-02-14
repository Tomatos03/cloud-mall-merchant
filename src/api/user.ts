import { http } from "@/utils/http"

const PREFIX = '/user'

interface UpdateProfileRequest {
  nickname?: string
  phone?: string
  email?: string
  avatar_url?: string
}

interface UpdateProfileResponse {
  uid: string
  nickname: string
  phone?: string
  email?: string
  avatar_url?: string
}

/**
 * 更新用户个人资料
 * @param uid 用户ID
 * @param data 要更新的资料数据
 */
export function updateUserProfile(uid: string, data: UpdateProfileRequest) {
  return http.put<UpdateProfileResponse>(`${PREFIX}/${uid}/profile`, data)
}
