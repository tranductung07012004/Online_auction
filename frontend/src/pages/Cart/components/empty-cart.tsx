import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

export const EmptyCart: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-[#f8f3ee] p-6 mb-4">
        <ShoppingBag className="h-12 w-12 text-[#c3937c]" />
      </div>
      <h2 className="text-2xl font-serif mb-2">Your shopping cart is empty</h2>
      <p className="text-[#404040] mb-8 text-center max-w-md">
        It seems that you haven't added any product to the cart. Keep shopping
        to find your favorite wedding dress.
      </p>
      <Link to="/products">
        <button className="bg-[#c3937c] hover:bg-[#a67563] text-white rounded-full px-8 py-3 font-medium">
          Continue shopping
        </button>
      </Link>
    </div>
  );
};
