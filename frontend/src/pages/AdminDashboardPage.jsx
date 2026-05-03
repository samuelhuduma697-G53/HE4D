import { Helmet } from 'react-helmet-async'
import { AdminDashboard } from '../components/admin/AdminDashboard'

export const AdminDashboardPage = () => {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard | Huduma Ecosystem</title>
      </Helmet>
      <AdminDashboard />
    </>
  )
}

export default AdminDashboardPage
