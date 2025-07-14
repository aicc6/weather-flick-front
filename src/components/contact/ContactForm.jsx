import { useForm } from 'react-hook-form'
import { useSubmitContactMutation } from '@/store/api/contactApi'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

const ContactForm = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()
  const [submitContact, { isLoading, isError, error }] =
    useSubmitContactMutation()

  const onSubmit = async (data) => {
    try {
      await submitContact(data).unwrap()
      reset()
      onSuccess?.()
    } catch (e) {
      // 에러 처리
    }
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
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
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
        <Input
          id="name"
          {...register('name', { required: true })}
          placeholder="이름을 입력하세요"
          aria-invalid={!!errors.name}
        />
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
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">이메일을 입력해주세요.</p>
        )}
      </div>

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
