import { Helmet } from 'react-helmet-async'
import { RegisterHelperForm } from '../components/auth/RegisterHelperForm'

export const RegisterHelperPage = () => {
  return (
    <>
      <Helmet>
        <title>Register as Helper | Huduma Ecosystem</title>
        <meta name="description" content="Join as a verified helper in the Huduma Ecosystem" />
      </Helmet>
      <RegisterHelperForm />
    </>
  )
}

export default RegisterHelperPage
