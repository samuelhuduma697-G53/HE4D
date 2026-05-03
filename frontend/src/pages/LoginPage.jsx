import { Helmet } from 'react-helmet-async'
import { LoginForm } from '../components/auth/LoginForm'

export const LoginPage = () => {
  return (
    <>
      <Helmet>
        <title>Sign In | Huduma Ecosystem</title>
        <meta name="description" content="Sign in to Huduma Ecosystem for crisis support" />
      </Helmet>
      <LoginForm />
    </>
  )
}

export default LoginPage
