import { Link } from "react-router-dom"

const HomePage = () => {
    return (
        <>
            <section className="text-center text-white py-16 bg-[#3674B5]">
                <div className="container mx-auto px-4">
                <h1 className="text-4xl font-bold">Welcome to KlearSplit!</h1>
                <p className="text-lg mt-3">
                    Easily manage and split bills with friends and family.
                </p>
                <Link
                    to="/register"
                    className="mt-4 inline-block bg-white text-[#1995ad] font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 hover:bg-gray-200"
                >
                    Get Started
                </Link>
                </div>
            </section>

            <section className="container mx-auto my-12 px-4">
                <h2 className="text-center text-2xl font-bold mb-6">Key Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div className="p-6 bg-gray-100 rounded-lg shadow-md">
                    <div className="text-5xl mb-3 text-[#1995ad]">💳</div>
                    <h4 className="text-xl font-semibold">Effortless Bill Splitting</h4>
                    <p className="text-gray-600">Quickly calculate each person's share.</p>
                </div>

                <div className="p-6 bg-gray-100 rounded-lg shadow-md">
                    <div className="text-5xl mb-3 text-[#1995ad]">📄</div>
                    <h4 className="text-xl font-semibold">Track Expenses</h4>
                    <p className="text-gray-600">Keep an organized record of who owes what.</p>
                </div>

                <div className="p-6 bg-gray-100 rounded-lg shadow-md">
                    <div className="text-5xl mb-3 text-[#1995ad]">📅</div>
                    <h4 className="text-xl font-semibold">Reminders</h4>
                    <p className="text-gray-600">Never forget to settle up with gentle reminders.</p>
                </div>
                </div>
            </section>
        </>
    )
}

export default HomePage
