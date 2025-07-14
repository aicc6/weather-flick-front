import { useForm } from 'react-hook-form'
import { useSubmitContactMutation } from '@/store/api/contactApi'

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <select {...register('category', { required: true })}>
        <option value="">문의 분류 선택</option>
        <option value="일반">일반</option>
        <option value="버그">버그</option>
        <option value="제안">제안</option>
      </select>
      <input {...register('title', { required: true })} placeholder="제목" />
      <textarea
        {...register('content', { required: true })}
        placeholder="문의 내용"
      />
      <input {...register('name', { required: true })} placeholder="이름" />
      <input
        {...register('email', { required: true })}
        placeholder="이메일"
        type="email"
      />
      <button type="submit" disabled={isLoading}>
        문의 접수하기
      </button>
      {isError && <div>에러: {error?.data?.detail || '문의 접수 실패'}</div>}
    </form>
  )
}

export default ContactForm
