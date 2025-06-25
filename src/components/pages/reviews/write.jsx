import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star } from '@/components/icons'

export function ReviewWritePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    destination: '',
    title: '',
    rating: 5,
    content: '',
    image: null,
    imageUrl: '',
  })
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  const renderStars = (rating, onChange) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          type="button"
          key={i}
          onClick={() => onChange(i)}
          className={`h-5 w-5 focus:outline-none ${i <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        >
          <Star />
        </button>,
      )
    }
    return <span className="flex">{stars}</span>
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (name === 'image' && files && files[0]) {
      const file = files[0]
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: file, imageUrl: reader.result }))
      }
      reader.readAsDataURL(file)
    } else {
      setForm({ ...form, [name]: value })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitError('')
    if (!form.destination || !form.title || !form.content) {
      setSubmitError('모든 항목을 입력해주세요.')
      return
    }
    setSuccess(true)
    setTimeout(() => {
      navigate('/reviews')
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">
          리뷰 작성
        </h1>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800"
        >
          {submitError && (
            <div className="text-sm text-red-500">{submitError}</div>
          )}
          {success && (
            <div className="mb-2 text-center text-green-600">
              리뷰가 등록되었습니다!
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">여행지</label>
            <input
              type="text"
              name="destination"
              value={form.destination}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
              placeholder="여행지를 입력하세요"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">제목</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
              placeholder="리뷰 제목을 입력하세요"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">평점</label>
            {renderStars(form.rating, (r) => setForm({ ...form, rating: r }))}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">내용</label>
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2"
              rows={4}
              placeholder="여행 후기를 입력하세요"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">
              사진 업로드
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
            />
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="리뷰 미리보기"
                className="mt-2 h-32 w-auto rounded border object-cover"
              />
            )}
          </div>
          <button
            type="submit"
            className="w-full rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700"
          >
            리뷰 등록
          </button>
          <button
            type="button"
            className="mt-2 w-full rounded border border-gray-300 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => navigate('/reviews')}
          >
            취소
          </button>
        </form>
      </div>
    </div>
  )
}
