import { useGetContactsQuery } from '@/store/api/contactApi'

const ContactList = () => {
  const { data: contacts = [], isLoading, isError } = useGetContactsQuery()

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
          <th>날짜</th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((c) => (
          <tr key={c.id}>
            <td>{c.category}</td>
            <td>{c.title}</td>
            <td>{c.name}</td>
            <td>{c.email}</td>
            <td>{new Date(c.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default ContactList
