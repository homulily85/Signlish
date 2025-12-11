import illustration from "@/assets/login-illustration.png"
import { LoginForm } from "@/components/login-form"
import Logo from "@/assets/logo.svg?react"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="h-12 w-auto overflow-hidden flex items-center">
              <Logo
                width={undefined}
                height={undefined}
                className="h-12 w-auto text-foreground transition-colors"
                preserveAspectRatio="xMidYMid meet"
              />
            </div>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <img
          src={illustration}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  )
}
