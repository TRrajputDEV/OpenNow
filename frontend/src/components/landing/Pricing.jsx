import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '₹0',
    description: 'Perfect for individual teachers',
    features: [
      'Up to 50 questions',
      'Up to 100 students',
      'Basic analytics',
      'Email support',
    ],
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    description: 'For growing institutions',
    features: [
      'Unlimited questions',
      'Unlimited students',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'Bulk operations',
    ],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Training sessions',
      'White-label solution',
    ],
  },
];

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  return (
    <section id="pricing" className="py-24 border-b">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const isSelected = selectedPlan === index;

            return (
              <div
                key={index}
                onClick={() => setSelectedPlan(index)}
                className={`
                  rounded-lg border p-8 space-y-6 cursor-pointer transition-all
                  ${plan.popular ? 'border-foreground shadow-lg' : ''}
                  ${isSelected ? 'border-2 border-blue-600 shadow-xl' : 'hover:shadow-md'}
                `}
              >
                {plan.popular && (
                  <div className="inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-semibold">
                    Popular
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    {plan.period && (
                      <span className="ml-1 text-sm text-muted-foreground">{plan.period}</span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Link to="/register">Get Started</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
