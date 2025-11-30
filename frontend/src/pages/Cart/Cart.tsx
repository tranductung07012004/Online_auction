import Header from '../../components/header';
import Footer from '../../components/footer';
import { ShoppingCart } from './components/shopping-cart';
const Cart = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#ead9c9]/20">
      <Header />
      <main className="flex-1 container mx-auto py-10 px-4">
        <h1 className="text-3xl font-serif text-center mb-8">Your Cart</h1>
        <ShoppingCart />
      </main>
      <Footer />
    </div>
  );
};

export default Cart;
