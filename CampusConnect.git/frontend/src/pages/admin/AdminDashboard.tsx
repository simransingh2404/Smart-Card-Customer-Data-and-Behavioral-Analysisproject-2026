import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'vendors' | 'users' | 'rfqs'>('vendors');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vendorRes, userRes, rfqRes] = await Promise.all([
        api.get('/admin/vendors'),
        api.get('/admin/users'),
        api.get('/admin/rfqs'),
      ]);
      setVendors(vendorRes.data);
      setUsers(userRes.data);
      setRfqs(rfqRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyVendor = async (vendorId: number) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}/verify`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectVendor = async (vendorId: number) => {
    try {
      await api.patch(`/admin/vendors/${vendorId}/reject`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyUser = async (userId: number) => {
    try {
      await api.patch(`/admin/users/${userId}/verify`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectUser = async (userId: number) => {
    try {
      await api.patch(`/admin/users/${userId}/reject`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const pendingApprovals = users.filter(u => !u.verified && u.role !== 'ADMIN').length;

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center shadow">
        <h1 className="text-xl font-bold">⚙️ CampusConnect — Admin Panel</h1>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-sm font-medium">Logout</button>
      </nav>

      <div className="max-w-6xl mx-auto p-6">

        {/* Pending Approvals Banner */}
        {pendingApprovals > 0 && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-5 py-4 rounded-xl mb-6 flex items-center gap-3">
            <span className="text-2xl">⏳</span>
            <div>
              <p className="font-bold">{pendingApprovals} user(s) waiting for approval</p>
              <p className="text-sm">Go to the Users tab to approve or reject them.</p>
            </div>
            <button onClick={() => setActiveTab('users')}
              className="ml-auto bg-yellow-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-yellow-600">
              Review Now
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
            <p className="text-gray-500 text-sm">Total Vendors</p>
            <p className="text-3xl font-bold text-gray-800">{vendors.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-green-500">
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-gray-800">{users.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Total RFQs</p>
            <p className="text-3xl font-bold text-gray-800">{rfqs.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          {['vendors', 'users', 'rfqs'].map((tab) => (
            <button key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-5 py-2 rounded-lg font-semibold capitalize transition ${activeTab === tab ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {tab}
              {tab === 'users' && pendingApprovals > 0 && (
                <span className="ml-2 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  {pendingApprovals}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : activeTab === 'vendors' ? (
          <div className="grid gap-4">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{vendor.companyName}</h3>
                    <p className="text-gray-500 text-sm">{vendor.email}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>📍 {vendor.city}, {vendor.state}</span>
                      <span>🏭 {vendor.businessType}</span>
                      <span>📅 {vendor.yearsOfExperience} years exp.</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      vendor.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                      vendor.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'}`}>
                      {vendor.verificationStatus}
                    </span>
                    {vendor.verificationStatus === 'PENDING' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleVerifyVendor(vendor.id)}
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-700">
                          Verify
                        </button>
                        <button onClick={() => handleRejectVendor(vendor.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-red-600">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'users' ? (
          <div className="grid gap-4">
            {users.filter(u => u.role !== 'ADMIN').map((user) => (
              <div key={user.id} className={`bg-white rounded-xl shadow p-5 border-l-4 ${
                user.verified ? 'border-green-500' : 'border-yellow-400'}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-800">{user.email}</p>
                      {user.verified && (
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        user.role === 'SCHOOL' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'}`}>
                        {user.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        user.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {user.verified ? 'Platform Access Granted' : 'Waiting for Approval'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!user.verified ? (
                      <>
                        <button onClick={() => handleVerifyUser(user.id)}
                          className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700">
                          ✓ Approve
                        </button>
                        <button onClick={() => handleRejectUser(user.id)}
                          className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-red-600">
                          ✕ Reject
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleRejectUser(user.id)}
                        className="bg-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300">
                        Revoke Access
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {rfqs.map((rfq: any) => (
              <div key={rfq.id} className="bg-white rounded-xl shadow p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{rfq.title}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <span>📦 {rfq.uniformType}</span>
                      <span>🔢 Qty: {rfq.quantity}</span>
                      <span>💰 ₹{rfq.budget?.toLocaleString()}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    rfq.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                    rfq.status === 'AWARDED' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'}`}>
                    {rfq.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}