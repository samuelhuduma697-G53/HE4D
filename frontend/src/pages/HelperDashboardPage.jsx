import { Helmet } from 'react-helmet-async'
import { HelperDashboard } from '../components/helper/HelperDashboard'

export const HelperDashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Helper Dashboard | Huduma Ecosystem</title>
      </Helmet>
      <HelperDashboard />
    </>
  )
}

export default HelperDashboardPage
