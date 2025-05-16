import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface SubmissionFormProps {
  onSubmit: (data: any) => void;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [awards, setAwards] = useState<string[]>([]);
  const [newAward, setNewAward] = useState('');

  const addAward = () => {
    if (newAward.trim()) {
      setAwards([...awards, newAward.trim()]);
      setNewAward('');
    }
  };

  const removeAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  const onSubmitForm = (data: any) => {
    const formData = new FormData();
    // Only append the PSA file for this endpoint
    if (data.file && data.file[0]) {
      formData.append('file', data.file[0]);
      formData.append('documentType', 'psa');
    }
    fetch('/api/student/document', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
      .then(res => res.json())
      .then(result => {
        // handle success
      })
      .catch(err => {
        // handle error
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6 max-w-2xl mx-auto p-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Graduation Verification Submission</h2>
        
        {/* PSA Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            PSA Birth Certificate
          </label>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            {...register('file', { required: 'PSA is required' })}
            className="w-full p-2 border rounded"
          />
          {typeof errors.file?.message === 'string' && (
            <p className="text-red-500 text-sm mt-1">{errors.file.message}</p>
          )}
        </div>

        {/* Photo Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Graduation Photo
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png"
            {...register('photo', { required: 'Photo is required' })}
            className="w-full p-2 border rounded"
          />
          {typeof errors.photo?.message === 'string' && (
            <p className="text-red-500 text-sm mt-1">{errors.photo.message}</p>
          )}
        </div>

        {/* Awards Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Awards & Honors
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newAward}
              onChange={(e) => setNewAward(e.target.value)}
              placeholder="Enter award name"
              className="flex-1 p-2 border rounded"
            />
            <button
              type="button"
              onClick={addAward}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          
          {/* Awards List */}
          <div className="space-y-2">
            {awards.map((award, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1">{award}</span>
                <button
                  type="button"
                  onClick={() => removeAward(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Submit for Verification
        </button>
      </div>
    </form>
  );
};