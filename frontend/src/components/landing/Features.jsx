import { 
  Zap, 
  Brain, 
  BarChart3, 
  Shield, 
  Clock, 
  Users 
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Instant results',
    description: 'Automated grading delivers results the moment students submit.',
  },
  {
    icon: Brain,
    title: 'Question bank',
    description: 'Build a reusable library. Create once, use everywhere.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track performance with detailed insights and trends.',
  },
  {
    icon: Shield,
    title: 'Secure',
    description: 'Enterprise-grade security for your exams and data.',
  },
  {
    icon: Clock,
    title: 'Scheduling',
    description: 'Built-in timers and auto-submission features.',
  },
  {
    icon: Users,
    title: 'Multi-role',
    description: 'Separate dashboards for students, teachers, and admins.',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 border-t">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Everything you need
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features for modern online testing
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="group">
              <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-all">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
