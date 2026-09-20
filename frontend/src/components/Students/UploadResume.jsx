import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const UploadResume = ({ fetchCurrentUserData }) => {
  const [uploadStatus, setUploadStatus] = useState('');

  // useState for load data
  const [currentUser, setCurrentUser] = useState({
    id: '',
    role: '',
  });

  // checking for authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${BASE_URL}/user/detail`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        setCurrentUser({
          id: res.data.id,
          role: res.data.role,
        });
      })
      .catch(err => {
        console.log("UploadResume.jsx => ", err);
      });
  }, []);


  // Handle resume upload
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!e.target.files[0]) {
      setUploadStatus('Please select a file');
      return;
    }

    const formData = new FormData();
    const file = e.target.files[0];
    if (!file.name.toLowerCase().endsWith('.pdf') || file.size > 5 * 1024 * 1024) {
      setUploadStatus('Choose a PDF no larger than 5 MB.');
      return;
    }
    formData.append('resume', e.target.files[0]);
    formData.append('userId', currentUser.id);

    try {
      await axios.post(`${BASE_URL}/student/upload-resume`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      // console.log(response.data)
      // update userData in UpdatePlacementProfile
      if (fetchCurrentUserData) fetchCurrentUserData();
      setUploadStatus('Resume uploaded successfully');
    } catch (error) {
      console.error('Error uploading the resume', error);
      setUploadStatus(error.response?.data?.msg || 'Error uploading the resume');
    }
  };

  return (
    <>
      {/* <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} /> */}
      <FloatingLabel controlId="floatingResume" label="Update Resume">
        <Form.Control
          type="file"
          accept='.pdf,application/pdf'
          placeholder="Upload Resume"
          name='resume'
          onChange={handleSubmit}
        />
        {uploadStatus && <p className='text-sm text-gray-300 mt-1'>{uploadStatus}</p>}
      </FloatingLabel>
    </>
  );
};

export default UploadResume;
