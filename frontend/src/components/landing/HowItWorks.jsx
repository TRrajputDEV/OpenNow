import { Users, FileText, Send, Award } from 'lucide-react';

const steps = [
  {
    icon: Users,
    title: 'Sign Up',
    description: 'Create your account as a teacher or student in seconds.',
    step: '01',
  },
  {
    icon: FileText,
    title: 'Create Questions',
    description: 'Build your question bank with MCQs, true/false, and more.',
    step: '02',
  },
  {
    icon: Send,
    title: 'Launch Exam',
    description: 'Schedule and publish exams to your students instantly.',
    step: '03',
  },
  {
    icon: Award,
    title: 'Get Results',
    description: 'Automatic grading delivers instant results and analytics.',
    step: '04',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 border-b">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-lg text-muted-foreground">
            Get started in minutes, not hours
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg border flex items-center justify-center flex-shrink-0">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="text-4xl font-bold text-muted-foreground/20">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 -right-4 w-8 h-[2px] bg-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
