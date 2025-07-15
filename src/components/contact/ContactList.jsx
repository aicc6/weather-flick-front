import {
  useGetContactsQuery,
  useIncrementContactViewsMutation,
} from '@/store/api/contactApi'
import { useCallback, useEffect } from 'react'

const ContactList = ({ onOpenDetail }) => {
  console.log('ContactList 렌더링', { onOpenDetail })

  const {
    data: contacts = [],
    isLoading,
    isError,
    refetch,
  } = useGetContactsQuery()
  const [incrementViews, { isLoading: isIncrementing }] =
    useIncrementContactViewsMutation()

  useEffect(() => {
    console.log('contacts:', contacts)
  }, [contacts])

  const handleTitleClick = useCallback(
    async (contact) => {
      console.log('handleTitleClick 실행', contact)
      try {
        const result = await incrementViews(contact.id).unwrap()
        console.log('incrementViews result:', result)
        await refetch()
        const updated = contacts.find((c) => c.id === contact.id)
        console.log('갱신된 contact:', updated)
        if (onOpenDetail) onOpenDetail(updated || contact)
      } catch (e) {
        console.error('조회수 증가 에러:', e)
        alert('조회수 증가에 실패했습니다')
      }
    },
    [incrementViews, onOpenDetail, refetch, contacts],
  )

  if (isLoading) return <div>로딩 중...</div>
  if (isError) return <div>목록 불러오기 실패</div>

  return (
    <table>
      <thead>
        <tr>
          <th>분류</th>
          <th>제목</th>
          <th>이름</th>
          <th>이메일</th>
          <th>답변여부</th>
          <th>조회수</th>
          <th>날짜</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((c) => (
          <tr key={c.id}>
            <td>{c.category}</td>
            <td>
              <button
                type="button"
                onClick={() => handleTitleClick(c)}
                disabled={isIncrementing}
                aria-label={`${c.title} 문의 상세 열기`}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'inherit',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {c.title}
              </button>
            </td>
            <td>{c.name}</td>
            <td>{c.email}</td>
            <td>{c.approval_status}</td>
            <td>{c.views}</td>
            <td>{new Date(c.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ContactList
