import { Footer } from './footer'
import { Header } from './header'

export function DefaultLayout({ children }) {
  return (
    <div className="bg-background text-foreground min-h-screen transition-colors">
      <Header />

      <main>{children}</main>

      <Footer />
    </div>
  )
}
