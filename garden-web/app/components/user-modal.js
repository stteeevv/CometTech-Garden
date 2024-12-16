import { useState } from "react";

export default function UserModal({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState(user.name.S);
  const [role, setRole] = useState(user.role.S);
  // user.plots.L is a list of objects { N: number }, convert into simply a list of numbers
  const [plots, setPlots] = useState(user.plots.L.map(plot => parseInt(plot.N, 10)));


  function onManageButtonPress() {
    setIsModalOpen(true);
  }

  function toggleModal() {
    setIsModalOpen(!isModalOpen);
  }
  function handleSubmit() {
    fetch(`/api/users/${user.email.S}`, {
      method: 'POST',
      body: JSON.stringify({ name, role, plots }),
    })
      .then((response) => response.json())
      .then((data) => {
        setIsModalOpen(false);
        //refresh page
        window.location.reload();
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
  const handleCheckboxChange = (plotNumber) => {
    if (plots.includes(plotNumber)) {
      setPlots(plots.filter((plot) => plot !== plotNumber));
    } else {
      setPlots([...plots, plotNumber]);
    }
  };
  return (
    <div>
      <button
        onClick={onManageButtonPress}
        className="bg-blue-500 text-white px-4 py-2 my-2 rounded-md"
      >
        Manage
      </button>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 flex justify-center items-center"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-[#e4eed3] p-6 rounded-md w-1/3"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-4">
              Edit information of user: {user.email.S}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Edit name"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Role</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  defaultValue={user.role.S}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="student">Student</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Plots</label>
                <div className="flex flex-wrap">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((plot) => (
                    <div key={plot} className="flex items-center mr-4">
                      <input
                        type="checkbox"
                        id={`plot-${plot}`}
                        checked={plots.includes(plot)}
                        onChange={() => handleCheckboxChange(plot)}
                        className="mr-2"
                      />
                      <label htmlFor={`plot-${plot}`}>{plot}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                  onClick={() => handleSubmit()}
                >
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
