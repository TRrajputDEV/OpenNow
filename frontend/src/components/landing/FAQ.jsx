import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'How does instant grading work?',
    answer: 'Our system automatically evaluates MCQ and True/False questions the moment students submit. Results are calculated instantly using predefined correct answers.',
  },
  {
    question: 'Can I reuse questions across multiple exams?',
    answer: 'Yes! Build your question bank once and reuse questions across unlimited exams. You can also organize questions by subject, difficulty, and category.',
  },
  {
    question: 'Is there a limit on the number of students?',
    answer: 'Free plan supports up to 100 students. Pro and Enterprise plans offer unlimited students.',
  },
  {
    question: 'What question types are supported?',
    answer: 'Currently we support Single Correct MCQ, Multiple Correct MCQ, and True/False questions. More types coming soon!',
  },
  {
    question: 'Can students see correct answers after submission?',
    answer: 'Yes, teachers can enable detailed review mode where students see correct answers, explanations, and their performance breakdown.',
  },
  {
    question: 'Is the data secure?',
    answer: 'Absolutely. We use enterprise-grade encryption, secure authentication, and follow best practices for data protection.',
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-24 border-b">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about ExamPortal
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
