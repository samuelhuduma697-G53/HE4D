import { Helmet } from 'react-helmet-async'
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm'

export const ForgotPasswordPage = () => {
  return (
    <>
      <Helmet>
        <title>Forgot Password | Huduma Ecosystem</title>
      </Helmet>
      <ForgotPasswordForm />
    </>
  )
}

export default ForgotPasswordPage
