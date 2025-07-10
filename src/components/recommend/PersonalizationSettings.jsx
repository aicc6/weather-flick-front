import { useState, useCallback, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { User, Heart, Wallet, Users, Save } from 'lucide-react'

const PersonalizationSettings = memo(
  ({ userPreferences, onPreferencesChange, onSave, className }) => {
    const [preferences, setPreferences] = useState({
      budget: [100000, 500000],
      travelStyle: 'balanced',
      interests: [],
      groupType: 'family',
      activityLevel: 3,
      accommodationType: 'hotel',
      transportPreference: 'car',
      dietaryRestrictions: [],
      personalNotes: '',
      notifications: {
        weatherAlerts: true,
        priceDrops: false,
        newRecommendations: true,
      },
      ...userPreferences,
    })

    // 관심사 옵션
    const interestOptions = [
      { id: 'nature', label: '🌿 자연', color: 'bg-green-100 text-green-800' },
      { id: 'culture', label: '🏛️ 문화', color: 'bg-blue-100 text-blue-800' },
      { id: 'food', label: '🍽️ 미식', color: 'bg-yellow-100 text-yellow-800' },
      {
        id: 'history',
        label: '📚 역사',
        color: 'bg-purple-100 text-purple-800',
      },
      { id: 'adventure', label: '🏔️ 모험', color: 'bg-red-100 text-red-800' },
      {
        id: 'relaxation',
        label: '🧘‍♀️ 힐링',
        color: 'bg-pink-100 text-pink-800',
      },
      {
        id: 'shopping',
        label: '🛍️ 쇼핑',
        color: 'bg-indigo-100 text-indigo-800',
      },
      {
        id: 'nightlife',
        label: '🌃 야간활동',
        color: 'bg-gray-100 text-gray-800',
      },
      {
        id: 'photography',
        label: '📸 사진',
        color: 'bg-orange-100 text-orange-800',
      },
      {
        id: 'wellness',
        label: '💆‍♀️ 웰니스',
        color: 'bg-emerald-100 text-emerald-800',
      },
    ]

    // 여행 스타일 옵션
    const travelStyleOptions = [
      {
        value: 'budget',
        label: '💰 알뜰형',
        description: '가성비를 중시하는 여행',
      },
      {
        value: 'balanced',
        label: '⚖️ 균형형',
        description: '가격과 품질의 균형을 추구',
      },
      {
        value: 'luxury',
        label: '✨ 프리미엄',
        description: '편안하고 고급스러운 여행',
      },
      {
        value: 'adventure',
        label: '🎒 모험형',
        description: '새로운 경험과 도전을 선호',
      },
    ]

    // 그룹 타입 옵션
    const groupTypeOptions = [
      { value: 'solo', label: '👤 혼자' },
      { value: 'couple', label: '💕 커플' },
      { value: 'family', label: '👨‍👩‍👧‍👦 가족' },
      { value: 'friends', label: '👥 친구들' },
      { value: 'business', label: '💼 비즈니스' },
    ]

    // 관심사 토글
    const handleInterestToggle = useCallback(
      (interestId) => {
        const newInterests = preferences.interests.includes(interestId)
          ? preferences.interests.filter((id) => id !== interestId)
          : [...preferences.interests, interestId]

        const newPreferences = { ...preferences, interests: newInterests }
        setPreferences(newPreferences)
        onPreferencesChange?.(newPreferences)
      },
      [preferences, onPreferencesChange],
    )

    // 예산 변경
    const handleBudgetChange = useCallback(
      (value) => {
        const newPreferences = { ...preferences, budget: value }
        setPreferences(newPreferences)
        onPreferencesChange?.(newPreferences)
      },
      [preferences, onPreferencesChange],
    )

    // 일반 설정 변경
    const handleSettingChange = useCallback(
      (key, value) => {
        const newPreferences = { ...preferences, [key]: value }
        setPreferences(newPreferences)
        onPreferencesChange?.(newPreferences)
      },
      [preferences, onPreferencesChange],
    )

    // 알림 설정 변경
    const handleNotificationChange = useCallback(
      (key, value) => {
        const newPreferences = {
          ...preferences,
          notifications: {
            ...preferences.notifications,
            [key]: value,
          },
        }
        setPreferences(newPreferences)
        onPreferencesChange?.(newPreferences)
      },
      [preferences, onPreferencesChange],
    )

    // 저장 핸들러
    const handleSave = useCallback(() => {
      onSave?.(preferences)
    }, [preferences, onSave])

    return (
      <Card className={`weather-card ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            개인화 설정
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 예산 설정 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              <Label className="font-medium">
                여행 예산: {preferences.budget[0].toLocaleString()}원 -{' '}
                {preferences.budget[1].toLocaleString()}원
              </Label>
            </div>
            <Slider
              value={preferences.budget}
              onValueChange={handleBudgetChange}
              max={2000000}
              min={50000}
              step={50000}
              className="w-full"
            />
          </div>

          {/* 여행 스타일 */}
          <div className="space-y-3">
            <Label className="font-medium">여행 스타일</Label>
            <RadioGroup
              value={preferences.travelStyle}
              onValueChange={(value) =>
                handleSettingChange('travelStyle', value)
              }
            >
              {travelStyleOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label
                    htmlFor={option.value}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-muted-foreground text-sm">
                      {option.description}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 관심사 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              <Label className="font-medium">관심사 (복수 선택 가능)</Label>
            </div>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((interest) => {
                const isSelected = preferences.interests.includes(interest.id)
                return (
                  <Badge
                    key={interest.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      isSelected ? interest.color : ''
                    }`}
                    onClick={() => handleInterestToggle(interest.id)}
                  >
                    {interest.label}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* 그룹 타입 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <Label className="font-medium">여행 동반자</Label>
            </div>
            <RadioGroup
              value={preferences.groupType}
              onValueChange={(value) => handleSettingChange('groupType', value)}
              className="flex flex-wrap gap-4"
            >
              {groupTypeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 활동 강도 */}
          <div className="space-y-3">
            <Label className="font-medium">
              활동 강도:{' '}
              {preferences.activityLevel === 1
                ? '여유롭게'
                : preferences.activityLevel === 2
                  ? '보통'
                  : preferences.activityLevel === 3
                    ? '적당히 활동적'
                    : preferences.activityLevel === 4
                      ? '매우 활동적'
                      : '극한 활동'}
            </Label>
            <Slider
              value={[preferences.activityLevel]}
              onValueChange={(value) =>
                handleSettingChange('activityLevel', value[0])
              }
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* 개인 메모 */}
          <div className="space-y-3">
            <Label className="font-medium">개인 메모</Label>
            <Textarea
              placeholder="여행 시 특별히 고려해야 할 사항이나 선호사항을 적어주세요..."
              value={preferences.personalNotes}
              onChange={(e) =>
                handleSettingChange('personalNotes', e.target.value)
              }
              className="min-h-[80px]"
            />
          </div>

          {/* 알림 설정 */}
          <div className="space-y-3">
            <Label className="font-medium">알림 설정</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="weather-alerts" className="text-sm">
                  날씨 변화 알림
                </Label>
                <Switch
                  id="weather-alerts"
                  checked={preferences.notifications.weatherAlerts}
                  onCheckedChange={(checked) =>
                    handleNotificationChange('weatherAlerts', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="price-drops" className="text-sm">
                  가격 할인 알림
                </Label>
                <Switch
                  id="price-drops"
                  checked={preferences.notifications.priceDrops}
                  onCheckedChange={(checked) =>
                    handleNotificationChange('priceDrops', checked)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-recommendations" className="text-sm">
                  새로운 추천 알림
                </Label>
                <Switch
                  id="new-recommendations"
                  checked={preferences.notifications.newRecommendations}
                  onCheckedChange={(checked) =>
                    handleNotificationChange('newRecommendations', checked)
                  }
                />
              </div>
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end border-t pt-4">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              설정 저장
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  },
)

PersonalizationSettings.displayName = 'PersonalizationSettings'

export default PersonalizationSettings
