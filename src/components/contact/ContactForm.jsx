import { useForm } from 'react-hook-form'
import { useSubmitContactMutation } from '@/store/api/contactApi'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const ContactForm = ({ onSuccess, defaultName = '', defaultEmail = '' }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm()
  const [submitContact, { isLoading, isError, error }] =
    useSubmitContactMutation()
  const [infoFilled, setInfoFilled] = useState(false)

  const isPublic = watch('is_public')

  const onSubmit = async (data) => {
    // 비공개일 때 password 유효성 검사
    if (data.is_public && (!data.password || data.password.length < 4)) {
      alert('비공개 문의는 4자 이상 비밀번호를 입력해야 합니다.')
      return
    }
    try {
      await submitContact(data).unwrap()
      reset()
      setInfoFilled(false)
      onSuccess?.()
    } catch (_e) {
      // 에러 처리
    }
  }

  // 내 정보 넣기 버튼 클릭 시
  const handleFillMyInfo = () => {
    setValue('name', defaultName)
    setValue('email', defaultEmail)
    setInfoFilled(true)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 문의 분류 */}
      <div>
        <Label htmlFor="category" className="mb-1 block">
          문의 분류 <span className="text-red-500">*</span>
        </Label>
        <select
          id="category"
          {...register('category', { required: true })}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">문의 분류 선택</option>
          <option value="일반 문의">일반 문의</option>
          <option value="버그 신고">버그 신고</option>
          <option value="기능 요청">기능 요청</option>
          <option value="기타">기타</option>
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">분류를 선택해주세요.</p>
        )}
      </div>

      {/* 제목 */}
      <div>
        <Label htmlFor="title" className="mb-1 block">
          제목 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          {...register('title', { required: true })}
          placeholder="제목을 입력하세요"
          aria-invalid={!!errors.title}
          className="border border-gray-300 bg-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">제목을 입력해주세요.</p>
        )}
      </div>

      {/* 문의 내용 */}
      <div>
        <Label htmlFor="content" className="mb-1 block">
          문의 내용 <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="content"
          {...register('content', { required: true })}
          placeholder="문의 내용을 입력하세요"
          rows={5}
          aria-invalid={!!errors.content}
          className="border border-gray-300 bg-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">문의 내용을 입력해주세요.</p>
        )}
      </div>

      {/* 이름 */}
      <div>
        <Label htmlFor="name" className="mb-1 block">
          이름 <span className="text-red-500">*</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="name"
            {...register('name', { required: true })}
            placeholder="이름을 입력하세요"
            aria-invalid={!!errors.name}
            className="border border-gray-300 bg-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleFillMyInfo}
            aria-label="내 정보 넣기"
          >
            내 정보 넣기
          </Button>
        </div>
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">이름을 입력해주세요.</p>
        )}
      </div>

      {/* 이메일 */}
      <div>
        <Label htmlFor="email" className="mb-1 block">
          이메일 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email', { required: true })}
          placeholder="이메일을 입력하세요"
          aria-invalid={!!errors.email}
          className="border border-gray-300 bg-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">이메일을 입력해주세요.</p>
        )}
      </div>

      {/* 비공개 체크박스 */}
      <div className="flex items-center gap-2">
        <input
          id="is_public"
          type="checkbox"
          {...register('is_public')}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <Label htmlFor="is_public" className="cursor-pointer select-none">
          비공개
        </Label>
        {/* 비공개 체크 시 비밀번호 입력란 동적 표시 */}
        {isPublic && (
          <Input
            id="password"
            type="password"
            placeholder="비밀번호(4자 이상)"
            {...register('password', {
              required: isPublic,
              minLength: { value: 4, message: '4자 이상 입력' },
            })}
            className="ml-4 w-48 border border-gray-300 bg-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            aria-invalid={!!errors.password}
          />
        )}
      </div>
      {isPublic && errors.password && (
        <p className="mt-1 text-sm text-red-600">
          {errors.password.message || '비밀번호를 입력해주세요.'}
        </p>
      )}

      {/* 제출 버튼 */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
        aria-label="문의 접수하기"
      >
        {isLoading ? '접수 중...' : '문의 접수하기'}
      </Button>
      {isError && (
        <div className="mt-2 text-center text-red-600">
          에러: {error?.data?.detail || '문의 접수 실패'}
        </div>
      )}
    </form>
  )
}

export default ContactForm
