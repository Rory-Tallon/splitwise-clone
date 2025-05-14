import Navbar from '../components/Navbar';
import SignupForm from '../components/SignupForm';

export default function Signup() {
  return (
    <main>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <SignupForm />
      </div>
    </main>
  );
}