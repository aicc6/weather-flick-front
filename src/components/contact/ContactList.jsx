import {
  useGetContactsQuery,
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

  useEffect(() => {
    console.log('contacts:', contacts)
  }, [contacts])

  const handleTitleClick = useCallback(
    (contact) => {
      console.log('handleTitleClick 실행', contact)
      if (onOpenDetail) onOpenDetail(contact)
    },
    [onOpenDetail],
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
