import { Footer } from './footer'
import { Header } from './header'

export function DefaultLayout({ children }) {
  return (
    <div>
      <Header />

      <main>{children}</main>

      <Footer />
    </div>
  )
}
