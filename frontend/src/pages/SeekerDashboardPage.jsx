import { Helmet } from 'react-helmet-async'
import { SeekerDashboard } from '../components/seeker/SeekerDashboard'

export const SeekerDashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Seeker Dashboard | Huduma Ecosystem</title>
      </Helmet>
      <SeekerDashboard />
    </>
  )
}

export default SeekerDashboardPage
