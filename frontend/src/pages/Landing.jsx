import { useNavigate } from "react-router-dom";


export default function Landing({ user }) {
    const navigate = useNavigate();


    return (
        <div className="p-8 text-center">
            <h1 className="text-3xl font-bold">Welcome {user ? user.name : "Guest"}!</h1>
            <p className="mt-4 text-lg">Learn sign language easily with our interactive platform.</p>


            <div className="mt-8 flex justify-center gap-4">
                {!user ? (
                    <>
                        <button
                            onClick={() => navigate('/login')}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="bg-green-600 text-white px-4 py-2 rounded"
                        >
                            Register
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-red-600 text-white px-4 py-2 rounded"
                    >
                        Logout
                    </button>
                )}
            </div>
        </div>
    );
}