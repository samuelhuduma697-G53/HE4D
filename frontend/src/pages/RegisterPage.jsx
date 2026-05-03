import { Helmet } from 'react-helmet-async'
import { RegisterSeekerForm } from '../components/auth/RegisterSeekerForm'

export const RegisterPage = () => {
  return (
    <>
      <Helmet>
        <title>Register as Seeker | Huduma Ecosystem</title>
        <meta name="description" content="Create a seeker account to get crisis support" />
      </Helmet>
      <RegisterSeekerForm />
    </>
  )
}

export default RegisterPage
