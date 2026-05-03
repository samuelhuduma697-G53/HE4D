import { Helmet } from 'react-helmet-async'
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm'

export const ResetPasswordPage = () => {
  return (
    <>
      <Helmet>
        <title>Reset Password | Huduma Ecosystem</title>
      </Helmet>
      <ResetPasswordForm />
    </>
  )
}

export default ResetPasswordPage
