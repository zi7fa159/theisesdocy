document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    if (document.getElementById('chapter-list-ul')) {
        populateChapterList();
    }
    if (document.body.id === 'chapter-page') {
        loadChapterContent();
    }
    if (document.getElementById('progress-tracker-div')) {
        displayProgress();
        const resetButton = document.getElementById('reset-progress-button');
        if (resetButton) {
            resetButton.addEventListener('click', resetAllProgress);
        }
    }
    if (document.getElementById('feedback-form')) {
        setupFeedbackFormListener(); // Renamed for clarity
    }
});

const courseData = {
    chapters: [
        // CHAPTER 1
        {
            id: 1,
            title: "Unleashing Your Inner Boss: Mindset, Vision & Goals",
            content: [
                { type: 'p', text: 'Welcome to "Be Your Own Damn Boss"! This first chapter is all about laying the critical groundwork for your entrepreneurial journey. Before you dive into business plans and marketing strategies, you need to cultivate the right mindset, define what success looks like for *you*, and set clear goals to get there. This chapter will help you tap into your inner strength, overcome mental hurdles, and build a solid foundation for the exciting path ahead. Being an entrepreneur is as much about inner work as it is about external actions. Let\'s begin!' },
                { type: 'h2', text: 'Section 1: Mastering Your Entrepreneurial Mindset' },
                { type: 'p', text: 'The journey of entrepreneurship is a marathon, not a sprint. It requires a particular way of thinking – an entrepreneurial mindset. This mindset isn\'t something you\'re necessarily born with; it\'s something you can cultivate and strengthen.' },
                { type: 'h3', text: 'Key Characteristics of an Entrepreneurial Mindset:' },
                { type: 'ul', items: [
                    '<strong>Resilience:</strong> The ability to bounce back from setbacks, disappointments, and failures. It\'s about viewing challenges as temporary and learning from them.',
                    '<strong>Adaptability & Flexibility:</strong> The business landscape is constantly changing. Entrepreneurs must be willing to pivot, adjust strategies, and embrace new information.',
                    '<strong>Proactivity & Initiative:</strong> Taking charge, seeking out opportunities, and not waiting for things to happen. It\'s about being a doer.',
                    '<strong>Calculated Risk-Tolerance:</strong> Entrepreneurship involves risk, but it\'s not about reckless gambling. It\'s about identifying risks, assessing potential outcomes, and making informed decisions.',
                    '<strong>Growth Mindset (vs. Fixed Mindset):</strong> Believing that your abilities and intelligence can be developed through dedication and hard work. A growth mindset embraces challenges, persists in the face of setbacks, sees effort as a path to mastery, learns from criticism, and finds lessons and inspiration in the success of others. A fixed mindset assumes abilities are static, leading to a desire to look smart, avoid challenges, and give up easily.',
                    '<strong>Problem-Solving Orientation:</strong> Viewing obstacles not as roadblocks but as puzzles to be solved. Entrepreneurs are creative thinkers who find solutions.'
                ]},
                { type: 'h3', text: 'Overcoming Limiting Beliefs & Imposter Syndrome' },
                { type: 'p', text: 'Many aspiring entrepreneurs, especially women, grapple with limiting beliefs ("I\'m not good enough," "I don\'t have enough experience," "What if people judge me?") and imposter syndrome (feeling like a fraud, despite evidence of competence).' },
                { type: 'h4', text: 'Strategies to Combat Limiting Beliefs:' },
                { type: 'ol', items: [
                    '<strong>Identify Them:</strong> What specific negative thoughts hold you back? Write them down.',
                    '<strong>Challenge Them:</strong> Where did this belief come from? Is it objectively true? What evidence contradicts it?',
                    '<strong>Reframe Them:</strong> Turn the negative thought into a positive or neutral one. For example, "I\'m not experienced enough" becomes "I am learning and growing, and I can seek out knowledge and mentorship."',
                    '<strong>Affirm Your Strengths:</strong> Regularly remind yourself of your skills, past achievements, and unique talents.'
                ]},
                { type: 'h4', text: 'Tackling Imposter Syndrome:' },
                { type: 'ul', items: [
                    '<strong>Acknowledge It:</strong> Know that it\'s a common feeling, especially among high-achievers.',
                    '<strong>Focus on Facts, Not Feelings:</strong> Your feelings aren\'t always reality. What evidence do you have of your competence?',
                    '<strong>Track Your Accomplishments:</strong> Keep a "brag file" of positive feedback and successes.',
                    '<strong>Talk About It:</strong> Share your feelings with trusted peers or mentors; you\'ll likely find you\'re not alone.',
                    '<strong>Stop Comparing:</strong> Your journey is unique. Focus on your own progress.'
                ]},
                { type: 'h3', text: 'Building Foundational Self-Confidence' },
                 { type: 'ul', items: [
                    '<strong>Set Small, Achievable Goals:</strong> Each accomplishment builds momentum.',
                    '<strong>Step Outside Your Comfort Zone:</strong> Growth happens when you stretch yourself.',
                    '<strong>Practice Self-Compassion:</strong> Be kind to yourself, especially when you make mistakes.',
                    '<strong>Seek Knowledge & Skills:</strong> The more competent you feel, the more confident you\'ll become.',
                    '<strong>Visualize Success:</strong> Imagine yourself achieving your goals.'
                ]},
                { type: 'h3', text: 'Managing Fear of Failure & Building Resilience' },
                { type: 'ul', items: [
                    '<strong>Reframe Failure:</strong> See failure not as an endpoint, but as a data point – an opportunity to learn, iterate, and improve. Most successful entrepreneurs have experienced failures.',
                    '<strong>Worst-Case Scenario Planning:</strong> Sometimes, articulating your worst fears can make them less daunting. What\'s the absolute worst that could happen, and how would you handle it?',
                    '<strong>Focus on the Process, Not Just the Outcome:</strong> Enjoy the journey of building something.',
                    '<strong>Develop a Support System:</strong> Lean on friends, family, mentors, or fellow entrepreneurs.'
                ]},
                { type: 'h3', text: 'Navigating Societal Expectations' },
                 { type: 'ul', items: [
                    '<strong>Define Your Own Success:</strong> Don\'t let external expectations dictate your path or your definition of a successful life and business.',
                    '<strong>Set Boundaries:</strong> Learn to say "no" to protect your time and energy.',
                    '<strong>Find Role Models:</strong> Look to other women who have successfully navigated similar paths.',
                    '<strong>Build Your Network:</strong> Connect with other women entrepreneurs who understand these specific challenges.'
                ]},
                { type: 'h2', text: 'Section 2: Crafting Your Vision' },
                { type: 'p', text: 'A clear vision is the compass for your entrepreneurial journey. It\'s the guiding star that keeps you focused and motivated, especially when things get tough.' },
                { type: 'h3', text: 'What is a Vision Statement? Why is it Important?' },
                { type: 'p', text: 'A <strong>vision statement</strong> is a declaration of your long-term aspirations for your business and for yourself as its leader. It paints a picture of the future you want to create.' },
                { type: 'p', text: '<strong>Importance:</strong>' },
                { type: 'ul', items: [
                    'Provides direction and focus.',
                    'Motivates and inspires you and potential team members.',
                    'Helps in decision-making (does this opportunity align with my vision?).',
                    'Attracts the right people and resources.'
                ]},
                { type: 'h3', text: 'Exercises/Prompts to Help Define Your Personal and Business Vision:' },
                { type: 'p', text: 'Take some quiet time to reflect on these questions. Write down your answers freely, without self-censorship.' },
                { type: 'h4', text: 'Looking Ahead (3-5 Years):' },
                { type: 'ul', items: [
                    'If your business is incredibly successful, what does it look like?',
                    'What impact is your business having on your customers? On your community? On the world?',
                    'What kind of leader are you? How do you feel running your business?',
                    'What does your ideal workday/work week look like?',
                    'What values are at the core of your business? (e.g., integrity, innovation, community, sustainability)'
                ]},
                { type: 'h4', text: 'Personal Fulfillment:' },
                { type: 'ul', items: [
                    'What do you want to achieve personally through this entrepreneurial journey? (e.g., financial independence, flexibility, creative expression, making a difference)',
                    'What legacy do you want to build?',
                    'How does your business align with your deepest passions and sense of purpose?'
                ]},
                { type: 'p', text: '<strong>Drafting Your Vision Statement:</strong> Based on your reflections, try to craft a concise statement (1-3 sentences) that captures the essence of your desired future. It should be ambitious yet believable, clear, and inspiring to you.' },
                { type: 'h3', text: 'Connecting Vision to Passion and Purpose' },
                { type: 'p', text: 'Your vision will be most powerful when it\'s deeply connected to what you\'re passionate about and the purpose you want to serve.'},
                { type: 'ul', items: [
                    '<strong>Passion:</strong> What activities make you feel energized and engaged? What problems do you genuinely care about solving?',
                    '<strong>Purpose:</strong> What kind of impact do you want to make? How can your business contribute to something larger than yourself?'
                ]},
                { type: 'h2', text: 'Section 3: Setting SMART Goals' },
                { type: 'p', text: 'Once you have a vision, you need a roadmap to get there. That\'s where goals come in. SMART goals provide clarity and trackable milestones.' },
                { type: 'h3', text: 'Explanation of SMART Criteria:' },
                { type: 'ul', items: [
                    '<strong>S - Specific:</strong> Clearly define what you want to accomplish. Avoid vague goals.',
                    '<strong>M - Measurable:</strong> Define how you will track progress and success.',
                    '<strong>A - Achievable (or Attainable):</strong> Your goals should be challenging but realistic given your current resources and constraints.',
                    '<strong>R - Relevant:</strong> Your goals should align with your overall vision and business objectives.',
                    '<strong>T - Time-bound:</strong> Set a deadline for achieving your goal. This creates urgency and helps with planning.'
                ]},
                { type: 'h3', text: 'Examples of SMART Goals for Early-Stage Entrepreneurs:' },
                { type: 'ul', items: [
                    '"To finalize my business name, logo, and basic branding guide (Specific, Measurable - completion, Relevant, Achievable) by the end of this month (Time-bound)."',
                    '"To complete a competitor analysis for three direct competitors (Specific, Measurable - completion, Relevant, Achievable) within the next two weeks (Time-bound)."',
                    '"To gain 50 new email subscribers for my newsletter (Specific, Measurable - number of subscribers, Relevant, Achievable) by attending two networking events in the next month (Time-bound)."'
                ]},
                { type: 'h3', text: 'Breaking Down Big Goals into Smaller, Actionable Steps:'},
                { type: 'p', text: 'Large goals can feel overwhelming. Break them down into smaller, weekly, or even daily tasks.' },
                { type: 'p', text: 'This chapter equipped you with foundational tools for your entrepreneurial journey. You\'ve learned about the importance of cultivating an entrepreneurial mindset, characterized by resilience, adaptability, and a growth orientation. We\'ve explored strategies to identify and overcome limiting beliefs and imposter syndrome, and how to build genuine self-confidence. You\'ve also delved into the power of crafting a compelling vision that aligns with your passions and purpose, and the necessity of setting SMART goals to turn that vision into reality. Remember, your mindset is your greatest asset. Nurture it, believe in your vision, and set clear goals to unleash your inner boss!' }
            ],
            quiz: [
                { question: "Which of the following is a key characteristic of a 'growth mindset' in entrepreneurship?", options: ["Believing your abilities are static and unchangeable.", "Avoiding challenges to prevent potential failure.", "Seeing effort as a path to mastery and learning from criticism.", "Feeling threatened by the success of others."], correctAnswer: "Seeing effort as a path to mastery and learning from criticism." },
                { question: "True or False: Imposter syndrome is a rare condition that only affects inexperienced individuals.", options: ["True", "False"], correctAnswer: "False" },
                { question: "A business vision statement is primarily used for:", options: ["Outlining specific daily tasks for your team.", "Describing your current financial status in detail.", "Securing immediate funding from investors.", "Providing long-term direction and inspiration for your business."], correctAnswer: "Providing long-term direction and inspiration for your business." },
                { question: "What does the 'A' in SMART goals stand for?", options: ["Ambitious", "Actionable", "Achievable", "Accountable"], correctAnswer: "Achievable" }
            ]
        },
        // CHAPTER 2
        {
            id: 2,
            title: "From Idea to Action: Business Planning & Validation",
            content: [
                { type: 'p', text: 'In Chapter 1, you worked on building a strong entrepreneurial mindset and defining your vision. Now, it\'s time to translate that inner work into a tangible business concept. This chapter guides you through the crucial early stages of entrepreneurship: taking an initial idea, refining it into a clear value proposition for a specific audience, validating that there\'s a real need for it, and finally, structuring your thoughts into a lean, actionable business plan. This is where your dream starts to take concrete shape!' },
                { type: 'h2', text: 'Section 1: Defining Your Business Concept & Value Proposition' },
                { type: 'p', text: 'Every successful business starts with a clear understanding of what it offers and to whom. This section helps you refine your initial spark of an idea into something more concrete.'},
                { type: 'h3', text: 'From Idea to Viable Concept:'},
                { type: 'p', text: 'Many ideas might seem promising initially, but a <em>viable business concept</em> solves a real problem or fulfills a genuine desire for a specific group of people, and does so in a way that can eventually be profitable.'},
                { type: 'h4', text: 'Sources of Ideas:'},
                { type: 'ul', items: [
                    '<strong>Solving a Problem:</strong> What frustrations do you or others experience? Can you offer a solution?',
                    '<strong>Passion Projects:</strong> Can your hobbies or interests be turned into a business?',
                    '<strong>Market Gaps:</strong> Do you see an underserved need in the market?',
                    '<strong>Improving Existing Solutions:</strong> Can you offer a better, faster, or cheaper version of something already out there?'
                ]},
                { type: 'h4', text: 'Initial Idea Screening:'},
                { type: 'ul', items: [
                    '<strong>Personal Fit:</strong> Does the idea align with your interests, skills, and vision? Will you be motivated to work on it long-term?',
                    '<strong>Market Potential (Preliminary):</strong> Is there a large enough group of people who might want this?',
                    '<strong>Feasibility (Initial):</strong> Can you realistically create and deliver this product or service?'
                ]},
                { type: 'h3', text: 'What is a Value Proposition?'},
                { type: 'p', text: 'Your <strong>value proposition</strong> is a clear statement that explains: What benefit you provide. For whom you provide it (your target customer). How you do it uniquely or better than alternatives. It’s the core reason why a customer should choose you over a competitor. It answers the customer\'s question: "What\'s in it for me?"'},
                { type: 'h3', text: 'Identifying Your Target Audience'},
                { type: 'p', text: 'You can\'t be everything to everyone. A <strong>target audience</strong> (or target customer) is a specific group of people you want to reach with your marketing efforts and serve with your products/services.'},
                { type: 'h2', text: 'Section 2: Market Research & Idea Validation' },
                { type: 'p', text: 'Once you have a clearer business concept and target audience, you <em>must</em> validate your idea. This means finding out if there\'s a real demand for your offering before you invest significant time and money.'},
                { type: 'h3', text: 'The Importance of Validation:'},
                { type: 'ul', items: [
                    'Reduces risk of building something nobody wants.',
                    'Saves time and resources.',
                    'Provides insights to refine your product/service.',
                    'Builds confidence in your business idea.'
                ]},
                { type: 'h3', text: 'Basic Market Research Techniques:'},
                { type: 'ul', items: [
                    '<strong>Surveys:</strong> Collect quantitative and qualitative data from a larger group.',
                    '<strong>Interviews:</strong> Conduct one-on-one conversations with potential customers.',
                    '<strong>Competitor Analysis:</strong> Identify who your direct and indirect competitors are. Analyze their strengths, weaknesses, pricing, marketing strategies, and customer reviews.',
                    '<strong>Online Research:</strong> Use search engines, social media, forums to understand trends, customer pain points, and existing solutions.'
                ]},
                { type: 'h3', text: 'Creating a Minimum Viable Product (MVP) Concept:'},
                { type: 'p', text: 'An MVP is the simplest version of your product or service that allows you to test your core assumptions with real users and gather feedback. Its purpose is to learn and validate, not to build a perfect, feature-rich product.'},
                { type: 'h2', text: 'Section 3: Introduction to Lean Business Planning' },
                { type: 'p', text: 'Forget the 50-page traditional business plan for now. In the early stages, a <strong>lean business plan</strong> (often visualized using a tool like the Lean Canvas) is much more practical and adaptable. It helps you quickly outline and test your business model.'},
                { type: 'h3', text: 'Why a Lean Plan?'},
                { type: 'ul', items: [
                    '<strong>Speed & Agility:</strong> Faster to create and easier to update as you learn.',
                    '<strong>Focus:</strong> Highlights the most critical assumptions of your business model.',
                    '<strong>Action-Oriented:</strong> Designed to be a living document that guides experimentation.',
                    '<strong>Customer-Centric:</strong> Emphasizes understanding and solving customer problems.'
                ]},
                { type: 'h3', text: 'Key Components of a Lean Business Plan (often based on the Lean Canvas):'},
                { type: 'ol', items: [
                    '<strong>Problem:</strong> What specific customer problem(s) are you solving?',
                    '<strong>Solution:</strong> What is your product/service, and how does it solve these problems?',
                    '<strong>Key Metrics:</strong> What key activities will you measure to track progress and success?',
                    '<strong>Unique Value Proposition (UVP):</strong> Why are you different, and why should customers buy from/work with you?',
                    '<strong>Unfair Advantage:</strong> What do you have that can\'t be easily copied or bought by competitors?',
                    '<strong>Channels:</strong> How will you reach your customer segments?',
                    '<strong>Customer Segments:</strong> Who are your target customers?',
                    '<strong>Cost Structure:</strong> What are your major costs in running the business?',
                    '<strong>Revenue Streams:</strong> How will your business make money?'
                ]},
                { type: 'p', text: 'Your first lean plan is a starting point filled with assumptions. The goal is to systematically test these assumptions. Be prepared to revise your plan based on feedback and learning.'},
                { type: 'p', text: 'Moving from a brilliant idea to a validated business concept is a critical step. In this chapter, you\'ve learned how to refine your idea into a compelling value proposition for a specific target audience. We explored practical market research techniques to validate your assumptions and the importance of developing an MVP to test your core offering. Finally, you were introduced to the lean business plan as a dynamic tool to outline your business model and guide your early-stage strategy. You\'re now equipped to take actionable steps toward building a business on a solid foundation.'}
            ],
            quiz: [
                { question: "What is the primary purpose of creating a Minimum Viable Product (MVP)?", options: ["To launch a perfect, feature-complete product to the mass market.", "To secure a large amount of funding from investors immediately.", "To test core business assumptions and gather feedback from early adopters with minimal resources.", "To create a detailed 5-year financial projection for the business."], correctAnswer: "To test core business assumptions and gather feedback from early adopters with minimal resources." },
                { question: "Identifying your target audience helps you to:", options: ["Create a product that appeals to absolutely everyone.", "Avoid all competition.", "Tailor your product and marketing messages effectively.", "Guarantee immediate profitability."], correctAnswer: "Tailor your product and marketing messages effectively." },
                { question: "True or False: A Lean Business Plan is a lengthy, static document that should only be updated once a year.", options: ["True", "False"], correctAnswer: "False" },
                { question: "Which of these elements is a core component of a strong Value Proposition?", options: ["A detailed list of all product features.", "A clear explanation of the benefit you provide to a specific customer.", "A comparison of your pricing to all competitors.", "Your company's complete history."], correctAnswer: "A clear explanation of the benefit you provide to a specific customer." }
            ]
        },
        // CHAPTER 3
        {
            id: 3,
            title: "Money Matters: Financial Literacy & Funding Your Dream",
            content: [
                { type: 'p', text: 'Talking about money can sometimes feel intimidating, but understanding and managing your business finances is absolutely critical for success and sustainability. This chapter demystifies essential financial concepts, explores various funding avenues available to you as an early-stage woman entrepreneur, and introduces you to smart pricing strategies. We\'ll also touch on building a basic financial forecast so you can confidently discuss your business\'s financial needs and potential. Financial literacy is financial empowerment – let\'s dive in!' },
                { type: 'h2', text: 'Section 1: Business Finance Basics' },
                { type: 'h3', text: 'Key Financial Terms:' },
                { type: 'ul', items: [
                    '<strong>Revenue (or Sales/Income):</strong> The total amount of money your business earns from its sales of products or services before any expenses are deducted.',
                    '<strong>Cost of Goods Sold (COGS) (or Cost of Sales):</strong> The direct costs associated with producing the goods or services you sell.',
                    '<strong>Gross Profit:</strong> Revenue minus COGS.',
                    '<strong>Operating Expenses (OpEx):</strong> The ongoing costs of running your business that are not directly tied to producing a product or service.',
                    '<strong>Net Profit (or Net Income/Earnings):</strong> What\'s left after you subtract all operating expenses from your gross profit. This is your "bottom line."',
                    '<strong>Cash Flow:</strong> The movement of money into and out of your business. Positive cash flow means more money is coming in than going out. <strong>Profit and cash flow are NOT the same.</strong>'
                ]},
                { type: 'h3', text: 'Understanding Basic Financial Statements (Simplified):' },
                { type: 'ul', items: [
                    '<strong>Income Statement (or Profit & Loss Statement - P&L):</strong> Shows your revenues, costs, and expenses over a specific period, ultimately calculating your net profit.',
                    '<strong>Cash Flow Statement:</strong> Tracks all the cash inflows and cash outflows over a period.'
                ]},
                { type: 'h3', text: 'Importance of Budgeting and Financial Planning:' },
                { type: 'ul', items: [
                    '<strong>Budgeting:</strong> Creating a plan for how you will spend your money.',
                    '<strong>Financial Planning:</strong> Looking ahead and setting financial goals for your business.'
                ]},
                { type: 'h3', text: 'Pricing Strategies:' },
                { type: 'ul', items: [
                    '<strong>Factors Influencing Pricing:</strong> Costs, Value, Competition, Target Customer.',
                    '<strong>Common Pricing Methods:</strong> Cost-Plus Pricing, Value-Based Pricing, Competitive Pricing.'
                ]},
                { type: 'h2', text: 'Section 2: Funding Your Business' },
                { type: 'p', text: 'Most businesses need some form of capital to start and grow. Here are common funding options:'},
                { type: 'ul', items: [
                    '<strong>Bootstrapping:</strong> Using your own personal savings and re-investing early revenue. Pros: Full ownership. Cons: Slower growth.',
                    '<strong>Debt Financing:</strong> Borrowing money (e.g., Small Business Loans, Lines of Credit). Pros: Retain ownership. Cons: Must be repaid with interest.',
                    '<strong>Grants:</strong> Money you don\'t have to repay (often from government or non-profits). Pros: Free money! Cons: Competitive, time-consuming applications.',
                    '<strong>Equity Financing:</strong> Selling a portion of your company (e.g., to Angel Investors, Venture Capital). Pros: Access to larger capital, expertise. Cons: Give up ownership and control.',
                    '<strong>Crowdfunding:</strong> Raising small amounts from many people online. Pros: Can validate idea, build buzz. Cons: Requires marketing effort, platform fees.'
                ]},
                { type: 'h3', text: 'Assessing Suitability & Choosing Funding Options:'},
                { type: 'p', text: 'Consider: How much money you need, stage of business, control tolerance, debt tolerance, and specific requirements of each source.'},
                { type: 'h2', text: 'Section 3: Basic Financial Forecasting & Confidence' },
                { type: 'p', text: 'A <strong>financial forecast</strong> is an estimate of your future financial performance. Even a simple one is valuable for planning and seeking funding.'},
                { type: 'h3', text: 'Key Elements of a Basic Forecast (e.g., for the next 12 months):' },
                { type: 'ul', items: [
                    '<strong>Sales Forecast:</strong> Estimate projected sales volume and revenue.',
                    '<strong>Expense Budget:</strong> Project your COGS and operating expenses.',
                    '<strong>Projected Profit and Loss:</strong> Estimate your net profit.',
                    '<strong>Cash Flow Projection:</strong> Estimate cash inflows and outflows to ensure you\'ll have enough cash.'
                ]},
                { type: 'h3', text: 'Developing Confidence in Discussing Financial Needs:' },
                { type: 'ul', items: [
                    'Know Your Numbers: Practice explaining your forecast.',
                    'Focus on Key Metrics.',
                    'Be Realistic and Transparent.',
                    'Tell a Story with your financials.',
                    'Practice Your Pitch.'
                ]},
                { type: 'p', text: 'Mastering your money matters is a cornerstone of being your own damn boss. This chapter introduced you to essential business finance terms, the basics of financial statements, and practical pricing strategies. We explored diverse funding options, from bootstrapping to seeking investors, with a focus on what\'s relevant for early-stage women entrepreneurs. Finally, we touched on the importance of financial forecasting to plan for the future and confidently discuss your financial needs. With this knowledge, you\'re better equipped to build a financially healthy and sustainable business.'}
            ],
            quiz: [
                { question: "True or False: Net Profit is the money you have in the bank at the end of the month.", options: ["True", "False"], correctAnswer: "False" },
                { question: "Which of these funding options typically involves selling a portion of your company's ownership?", options: ["Bootstrapping", "Small Business Loan", "Angel Investment", "A government grant"], correctAnswer: "Angel Investment" },
                { question: "Value-based pricing primarily considers which factor when setting a price?", options: ["The total cost of producing the product plus a standard markup.", "The average price charged by direct competitors.", "The perceived worth and benefit of the product/service to the customer.", "The business's monthly operating expenses."], correctAnswer: "The perceived worth and benefit of the product/service to the customer." },
                { question: "A cash flow projection helps a business to:", options: ["Calculate its exact net profit for the previous year.", "Determine the total market share it has captured.", "Estimate future cash inflows and outflows to identify potential shortages.", "Choose the best legal structure for the company."], correctAnswer: "Estimate future cash inflows and outflows to identify potential shortages." }
            ]
        },
        // CHAPTER 4
        {
            id: 4,
            title: "Getting the Word Out: Marketing & Sales Fundamentals",
            content: [
                { type: 'p', text: 'You\'ve developed your mindset, validated your idea, and started thinking about the finances. Now, how do you get customers? This chapter is all about marketing and sales – the engines that drive revenue and growth for your business. We\'ll cover foundational marketing strategies, explore practical and low-cost tactics to reach your audience, and introduce essential sales skills to help you convert interest into paying customers. Effective marketing isn\'t about shouting the loudest; it\'s about connecting with the right people with the right message.' },
                { type: 'h2', text: 'Section 1: Laying Your Marketing Foundation' },
                { type: 'h3', text: 'Revisiting Your Target Audience: The Heart of Your Marketing' },
                { type: 'p', text: 'All your marketing efforts – your messaging, the platforms you choose, the content you create – should be tailored to resonate with your ideal customer.' },
                { type: 'h3', text: 'Defining Your Brand Identity: More Than Just a Logo' },
                { type: 'p', text: 'Your <strong>brand</strong> is the overall perception and feeling people have about your company. It\'s what you stand for and the promise you make to your customers.' },
                { type: 'ul', items: [
                    '<strong>Key Elements:</strong> Brand Name, Logo & Visuals, Brand Voice/Tone, Brand Values, Unique Selling Proposition (USP).'
                ]},
                { type: 'h3', text: 'Key Messaging: What You Want to Say' },
                { type: 'p', text: 'Your <strong>key messages</strong> are the core ideas you want your target audience to understand and remember about your brand and offerings. They should be clear, customer-focused, consistent, and believable.' },
                { type: 'h2', text: 'Section 2: Practical & Low-Cost Marketing Tactics' },
                { type: 'h3', text: 'Online Marketing Strategies:' },
                { type: 'ul', items: [
                    '<strong>Social Media Marketing:</strong> Choose 1-2 platforms where your target audience spends time. Share valuable content, engage, use good visuals, and be consistent.',
                    '<strong>Content Marketing (and Simple SEO):</strong> Create and share valuable content (blogging). Use relevant keywords naturally in your content for SEO.',
                    '<strong>Email Marketing:</strong> Build your list by offering a lead magnet. Send regular newsletters with value and promotions. Always get permission.',
                    '<strong>Online Directories & Local SEO:</strong> List on Google Business Profile, Yelp, etc., for local visibility.'
                ]},
                { type: 'h3', text: 'Offline Marketing Strategies:' },
                { type: 'ul', items: [
                    '<strong>Networking:</strong> Attend events, focus on genuine relationships, be ready with your key messages.',
                    '<strong>Local Events & Partnerships:</strong> Participate in markets, collaborate with complementary businesses.',
                    '<strong>Word-of-Mouth Marketing:</strong> Encourage by providing excellent service and asking for testimonials.'
                ]},
                { type: 'h2', text: 'Section 3: Sales Skills for Entrepreneurs Who Hate "Selling"' },
                { type: 'p', text: 'Reframe sales as helping your customers solve their problems.'},
                { type: 'h3', text: 'The Sales Mindset: Helping, Not Pushing' },
                { type: 'ul', items: [
                    'Focus on the Customer: Understand their needs.',
                    'Be a Problem Solver: Position your product as the solution.',
                    'Build Trust & Rapport.',
                    'Authenticity: Be yourself.'
                ]},
                { type: 'h3', text: 'Understanding the Customer Journey / Sales Funnel (Simplified)' },
                { type: 'p', text: 'Stages: Awareness, Interest, Consideration/Desire, Action/Conversion, Loyalty/Advocacy.' },
                { type: 'h3', text: 'Basic Sales Techniques & Understanding Customer Psychology:' },
                { type: 'ul', items: [
                    '<strong>Active Listening:</strong> Pay full attention.',
                    '<strong>Asking Effective Questions:</strong> Use open-ended questions.',
                    '<strong>Highlighting Benefits, Not Just Features.</strong>',
                    '<strong>Handling Objections:</strong> View as requests for more information. Listen, acknowledge, clarify, offer solutions.',
                    '<strong>Social Proof:</strong> Testimonials and reviews influence decisions.'
                ]},
                { type: 'h3', text: 'Importance of Customer Service & Building Relationships:'},
                { type: 'p', text: 'Excellent customer service is key to retention and referrals. Focus on long-term relationships.'},
                { type: 'p', text: 'Getting the word out effectively is a blend of smart strategy and authentic connection. This chapter laid the groundwork for your marketing by focusing on brand identity and key messaging tailored to your target audience. We explored a range of practical, low-cost online and offline marketing tactics to help you generate leads. Finally, we reframed sales as a helping profession and introduced essential skills and psychological insights to guide potential customers from awareness to action. By consistently applying these fundamentals, you can attract your ideal customers and grow your business.'}
            ],
            quiz: [
                { question: "Your 'brand identity' primarily refers to:", options: ["The amount of profit your company makes.", "The legal structure of your business.", "The overall perception and feeling people have about your company, including its name, visuals, and values.", "Your business registration number."], correctAnswer: "The overall perception and feeling people have about your company, including its name, visuals, and values." },
                { question: "True or False: When starting out, it's best to be active on every social media platform to maximize your potential reach.", options: ["True", "False"], correctAnswer: "False" },
                { question: "Which of the following is a key benefit of email marketing?", options: ["It guarantees immediate sales with every email sent.", "It allows you to build a direct relationship with your audience and share valuable content.", "It's the only marketing tactic that doesn't require any content creation.", "It's primarily used for reaching a very broad, untargeted audience."], correctAnswer: "It allows you to build a direct relationship with your audience and share valuable content." },
                { question: "When handling a customer's objection during a sales conversation, it's most effective to:", options: ["Immediately offer a discount to close the sale quickly.", "Argue with the customer to prove your point.", "Ignore the objection and change the subject.", "Listen to understand the concern, acknowledge it, and then provide a thoughtful response or solution."], correctAnswer: "Listen to understand the concern, acknowledge it, and then provide a thoughtful response or solution." }
            ]
        },
        // CHAPTER 5
        {
            id: 5,
            title: "Building Your Empire: Operations, Systems & Growth",
            content: [
                { type: 'p', text: 'You\'re attracting customers and making sales – fantastic! But to build a sustainable and thriving business, you need efficient operations, smart systems, and a plan for growth. This chapter focuses on the "behind-the-scenes" work that keeps your business running smoothly. We\'ll cover essential operational setups, strategies for managing your precious time and energy, and foundational concepts for scaling your empire when the time is right. This is about building a business that not only survives but also supports your long-term vision and lifestyle.' },
                { type: 'h2', text: 'Section 1: Establishing Your Operational Backbone' },
                { type: 'p', text: 'Solid operations are the foundation of a well-run business. Even as a solopreneur, setting up basic systems from the start will save you headaches later.'},
                { type: 'h3', text: 'Key Operational Needs & Basic Systems:' },
                { type: 'ul', items: [
                    '<strong>Legal & Administrative Basics:</strong> Business registration, permits/licenses (consult local authorities).',
                    '<strong>Financial Tracking & Management:</strong> Separate bank accounts, bookkeeping system (spreadsheets or software), invoicing system.',
                    '<strong>Customer Service Systems:</strong> Communication channels, response time expectations, FAQ document.',
                    '<strong>Standard Operating Procedures (SOPs):</strong> Documented step-by-step instructions for routine tasks. Ensures consistency, saves energy, helps delegation.'
                ]},
                { type: 'h2', text: 'Section 2: Boss-Level Productivity & Work-Life Integration' },
                { type: 'p', text: 'As an entrepreneur, your time and energy are your most valuable resources. Managing them effectively is crucial.'},
                { type: 'h3', text: 'Strategies for Time Management & Productivity:' },
                { type: 'ul', items: [
                    '<strong>Prioritization Techniques:</strong> Eisenhower Matrix (Urgent/Important), Pareto Principle (80/20 Rule), Eat the Frog.',
                    '<strong>Time Blocking & Scheduling:</strong> Allocate specific time blocks for different tasks.',
                    '<strong>Tools for Productivity:</strong> Digital calendars, task managers, note-taking apps.',
                    '<strong>Batching Similar Tasks:</strong> Group similar activities to reduce context-switching.',
                    '<strong>Minimize Distractions.'</strong>
                ]},
                { type: 'h3', text: 'Delegation: You Don\'t Have to Do It All' },
                { type: 'p', text: 'Delegate tasks that are repetitive, time-consuming, outside your zone of genius, or can be done more cost-effectively by someone else (e.g., administrative work, social media scheduling).'},
                { type: 'h3', text: 'Achieving Work-Life Integration & Avoiding Burnout:' },
                { type: 'ul', items: [
                    '<strong>Set Boundaries:</strong> Define work hours.',
                    '<strong>Schedule Downtime & Self-Care.</strong>',
                    '<strong>Recognize Signs of Burnout.</strong>',
                    '<strong>Build a Support System.</strong>',
                    '<strong>Remember Your "Why".</strong>'
                ]},
                { type: 'h2', text: 'Section 3: Planning for Sustainable Growth & Scaling' },
                { type: 'p', text: 'Growth is exciting, but it needs to be managed strategically to be sustainable.'},
                { type: 'h3', text: 'Foundational Concepts for Scaling:' },
                { type: 'ul', items: [
                    '<strong>Signs Your Business Might Be Ready to Grow/Scale:</strong> Consistently meeting demand, strong customer loyalty, stable cash flow, owner becoming a bottleneck, documented systems.',
                    '<strong>Different Growth Strategies:</strong> Market Penetration, Market Development, Product/Service Development, Diversification.',
                    '<strong>Building a Team (When Ready):</strong> Focus on roles that free your time or fill skill gaps. Consider freelancers vs. employees.',
                    '<strong>Maintaining Quality as You Scale:</strong> Strong SOPs, training, quality control, customer feedback.',
                    '<strong>Technology & Automation:</strong> Identify tasks that can be automated.',
                    '<strong>Importance of Continuous Learning and Adaptation.</strong>'
                ]},
                { type: 'p', text: 'Building your empire requires more than just a great idea; it demands solid operational foundations, smart productivity habits, and a thoughtful approach to growth. This chapter equipped you with an understanding of key operational needs and the importance of systems like SOPs. You learned practical strategies for managing your time, prioritizing tasks, and integrating work with life to avoid burnout. Finally, we explored foundational concepts for scaling your business sustainably, from recognizing readiness to building a team and maintaining quality. By implementing these principles, you can build a business that\'s not just successful, but also efficient and enduring.'}
            ],
            quiz: [
                { question: "Standard Operating Procedures (SOPs) are primarily useful for:", options: ["Only businesses with more than 50 employees.", "Ensuring consistency, saving mental energy, and making tasks easier to delegate.", "Complicating simple tasks unnecessarily.", "Replacing the need for any financial tracking."], correctAnswer: "Ensuring consistency, saving mental energy, and making tasks easier to delegate." },
                { question: "The Eisenhower Matrix helps you prioritize tasks by categorizing them based on:", options: ["How long they take and how much they cost.", "Urgency and Importance.", "Who assigned the task and when it's due.", "Your personal interest and the potential for fun."], correctAnswer: "Urgency and Importance." },
                { question: "True or False: Work-life integration means achieving a perfect 50/50 split between your work hours and personal hours every single day.", options: ["True", "False"], correctAnswer: "False" },
                { question: "Which of the following is a common sign that a business may be ready to scale?", options: ["The owner has plenty of free time and is looking for new challenges.", "Sales are declining, indicating a need for a new strategy.", "The business is consistently struggling to meet customer demand with its current capacity.", "There are no documented systems or processes in place."], correctAnswer: "The business is consistently struggling to meet customer demand with its current capacity." }
            ]
        },
        // CHAPTER 6
        {
            id: 6,
            title: "The Power of Connection: Building Your Network & Support System",
            content: [
                { type: 'p', text: 'Entrepreneurship can sometimes feel like a solitary path, but it absolutely doesn\'t have to be. In fact, success is often amplified by the connections you make and the support systems you build. This final chapter is dedicated to "The Power of Connection." We\'ll explore the immense value of professional networking, how to find and engage with mentors and communities, and the crucial role of your personal support system. You\'ll also learn how to effectively communicate your business vision to enlist help and rally support. You are not alone on this journey!' },
                { type: 'h2', text: 'Section 1: The Indispensable Value of Your Network' },
                { type: 'h3', text: 'Why Networking is Crucial:' },
                { type: 'ul', items: [
                    '<strong>Opportunities:</strong> New clients, partnerships, collaborations.',
                    '<strong>Learning & Knowledge Sharing:</strong> Gain insights and advice.',
                    '<strong>Support & Encouragement:</strong> Connect with people who understand.',
                    '<strong>Problem Solving:</strong> Diverse perspectives and solutions.',
                    '<strong>Increased Visibility & Credibility.'</strong>
                ]},
                { type: 'h3', text: 'Types of Valuable Connections:' },
                { type: 'ul', items: ['Peers', 'Mentors', 'Advisors', 'Industry Contacts', 'Connectors']},
                { type: 'h3', text: 'Overcoming Networking Anxiety:' },
                { type: 'ul', items: [
                    'Reframe networking as building genuine relationships.',
                    'Prepare an Elevator Pitch: Briefly explain what you do, who you help, and your uniqueness.',
                    'Set Small Goals: Aim for 1-2 meaningful conversations.',
                    'Ask Open-Ended Questions: Show genuine interest.',
                    'Listen Actively.',
                    'Focus on Giving: How can you offer value?'
                ]},
                { type: 'h2', text: 'Section 2: Strategies for Building & Engaging Your Network' },
                { type: 'h3', text: 'Online Networking:' },
                { type: 'ul', items: [
                    '<strong>LinkedIn:</strong> Optimize profile, connect strategically, engage with content.',
                    '<strong>Industry Forums & Online Communities:</strong> Participate in discussions.',
                    '<strong>Social Media Groups.'</strong>
                ]},
                { type: 'h3', text: 'Offline Networking (Includes Virtual Events):' },
                { type: 'ul', items: [
                    'Industry Events & Conferences.',
                    'Local Business Meetups & Workshops.',
                    'Alumni Networks.'
                ]},
                { type: 'h3', text: 'How to Network Effectively:' },
                { type: 'ul', items: ['Be Genuine', 'Focus on Quality over Quantity', 'Offer Value First', 'Follow Up', 'Nurture Relationships']},
                { type: 'h3', text: 'Finding and Engaging with Mentors & Advisors:' },
                { type: 'p', text: 'A <strong>Mentor</strong> provides guidance, wisdom, and support. Identify people you admire, be specific in your ask, respect their time, and be prepared for meetings.'},
                { type: 'h3', text: 'Pitching Your Business and Seeking Support:' },
                { type: 'p', text: 'Know your audience, focus on problem/solution, highlight your USP, show passion, be clear about your "ask," and practice!'},
                { type: 'h2', text: 'Section 3: Cultivating Your Personal Support System' },
                { type: 'p', text: 'Your professional network is vital, but so is your personal support system.'},
                { type: 'h3', text: 'The Role of Friends, Family, and Partners:' },
                { type: 'p', text: 'They can be your biggest cheerleaders. Communicate your journey, set expectations, and ask for specific support.'},
                { type: 'h3', text: 'Finding Communities of Like-Minded Women Entrepreneurs:' },
                { type: 'p', text: 'Seek out groups for shared experiences, understanding, and mutual empowerment.'},
                { type: 'h3', text: 'The Unwavering Importance of Self-Care & Resilience:' },
                { type: 'p', text: 'Revisit Chapter 1. Prioritize self-care to avoid burnout. Your personal support system can encourage this.'},
                { type: 'hr' },
                { type: 'h2', text: 'Course Conclusion' },
                { type: 'p', text: 'Congratulations on completing "Be Your Own Damn Boss"! You\'ve journeyed from cultivating an empowered mindset and crafting your vision, through planning and validating your idea, understanding your finances, marketing your offerings, and setting up your operations. You are equipped with foundational knowledge and actionable strategies to confidently pursue your entrepreneurial dreams.'},
                { type: 'p', text: 'The path of an entrepreneur is one of continuous learning and growth. Revisit these chapters as you progress. Take the tools and insights you’ve gained and, most importantly, <strong>take action</strong>. Believe in yourself, trust your vision, and remember the power of your unique voice and capabilities.'},
                { type: 'p', text: 'You have what it takes to be your own damn boss. Now go out there and build the business and life you envision!'}
            ],
            quiz: [
                { question: "True or False: The primary goal of networking should always be to see what others can immediately do for your business.", options: ["True", "False"], correctAnswer: "False" },
                { question: "A mentor is typically someone who:", options: ["You hire to perform specific, paid tasks for your business.", "Offers guidance, shares wisdom, and provides support based on their own experience.", "Is your direct competitor in the same market.", "Agrees with every idea you have without question."], correctAnswer: "Offers guidance, shares wisdom, and provides support based on their own experience." },
                { question: "When communicating your entrepreneurial journey to your personal support system (family/friends), it's helpful to:", options: ["Only share your successes to avoid worrying them.", "Expect them to understand every detail of your business operations.", "Be open about your vision and ask for specific ways they can support you.", "Avoid talking about your business altogether to maintain separation."], correctAnswer: "Be open about your vision and ask for specific ways they can support you." },
                { question: "Developing a clear and concise \"elevator pitch\" for your business is primarily useful for:", options: ["Writing long-form content for your blog.", "Quickly and effectively introducing yourself and your business in networking situations.", "Calculating your business's net profit.", "Designing your company logo."], correctAnswer: "Quickly and effectively introducing yourself and your business in networking situations." }
            ]
        }
    ]
};

// --- chapters.html ---
function populateChapterList() {
    const chapterListUl = document.getElementById('chapter-list-ul');
    if (!chapterListUl) return;

    const progress = getProgress();

    courseData.chapters.forEach(chapter => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = `chapter_template.html?chapter=${chapter.id}`;
        link.textContent = `Chapter ${chapter.id}: ${chapter.title}`;
        if (progress[chapter.id]?.completed) {
            link.classList.add('completed');
            link.textContent += " (Completed)";
        }
        listItem.appendChild(link);
        chapterListUl.appendChild(listItem);
    });
}

// --- chapter_template.html ---
function loadChapterContent() {
    const urlParams = new URLSearchParams(window.location.search);
    const chapterId = parseInt(urlParams.get('chapter'));

    if (!chapterId || chapterId < 1 || chapterId > courseData.chapters.length) {
        document.getElementById('chapter-content-article').innerHTML = "<p>Invalid chapter selected.</p>";
        return;
    }
    document.body.id = 'chapter-page'; // Ensure body ID is set

    const chapter = courseData.chapters.find(c => c.id === chapterId);
    if (!chapter) {
        document.getElementById('chapter-content-article').innerHTML = "<p>Chapter not found.</p>";
        return;
    }

    document.title = `${chapter.title} - Be Your Own Damn Boss`;
    document.getElementById('chapter-main-title').textContent = chapter.title;

    const contentArticle = document.getElementById('chapter-content-article');
    contentArticle.innerHTML = ''; // Clear "Loading..." text

    chapter.content.forEach(item => {
        let element;
        if (item.type === 'h1' || item.type === 'h2' || item.type === 'h3' || item.type === 'h4' || item.type === 'h5' || item.type === 'h6') {
            element = document.createElement(item.type);
            element.innerHTML = item.text;
        } else if (item.type === 'p') {
            element = document.createElement('p');
            element.innerHTML = item.text;
        } else if (item.type === 'ul' || item.type === 'ol') {
            element = document.createElement(item.type);
            item.items.forEach(liText => {
                const listItem = document.createElement('li');
                listItem.innerHTML = liText;
                element.appendChild(listItem);
            });
        } else if (item.type === 'hr') {
            element = document.createElement('hr');
        }
        if (element) {
            contentArticle.appendChild(element);
        }
    });

    const quizContentDiv = document.getElementById('quiz-content-div');
    quizContentDiv.innerHTML = '';
    const quizResultDiv = document.getElementById('quiz-result-div');
    quizResultDiv.innerHTML = '';
    quizResultDiv.className = 'quiz-result-div'; // Reset class

    if (chapter.quiz && chapter.quiz.length > 0) {
        chapter.quiz.forEach((q, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'quiz-question';
            questionDiv.dataset.questionIndex = index;

            const questionP = document.createElement('p');
            questionP.textContent = `${index + 1}. ${q.question}`;
            questionDiv.appendChild(questionP);

            q.options.forEach((opt, optIndex) => {
                const label = document.createElement('label');
                const radio = document.createElement('input');
                radio.type = 'radio';
                radio.name = `question${index}`;
                radio.value = opt;
                radio.id = `q${index}_opt${optIndex}`;
                label.htmlFor = radio.id;

                label.prepend(radio);
                label.append(document.createTextNode(` ${opt}`));
                questionDiv.appendChild(label);
            });
            quizContentDiv.appendChild(questionDiv);
        });
        document.getElementById('submit-quiz-button').classList.remove('hidden');
    } else {
        quizContentDiv.innerHTML = "<p>No quiz for this chapter.</p>";
        document.getElementById('submit-quiz-button').classList.add('hidden');
    }

    updateChapterCompletionStatus(chapterId);
    setupNavigationButtons(chapterId);

    const submitQuizButton = document.getElementById('submit-quiz-button');
     if (submitQuizButton && chapter.quiz && chapter.quiz.length > 0) {
        const newButton = submitQuizButton.cloneNode(true);
        submitQuizButton.parentNode.replaceChild(newButton, submitQuizButton);
        newButton.addEventListener('click', () => handleSubmitQuiz(chapterId));
    }


    const markCompleteButton = document.getElementById('mark-complete-button');
    const newMarkCompleteButton = markCompleteButton.cloneNode(true);
    markCompleteButton.parentNode.replaceChild(newMarkCompleteButton, markCompleteButton);
    newMarkCompleteButton.addEventListener('click', () => {
        markChapterComplete(chapterId);
    });
}

function handleSubmitQuiz(chapterId) {
    const chapter = courseData.chapters.find(c => c.id === chapterId);
    if (!chapter || !chapter.quiz) {
        document.getElementById('quiz-result-div').textContent = 'Quiz data not found.';
        return;
    }

    let score = 0;
    const questionsHtml = document.querySelectorAll('#quiz-content-div .quiz-question');

    questionsHtml.forEach((questionElement, index) => {
        const questionIndex = parseInt(questionElement.dataset.questionIndex);
        const selectedOptionInput = questionElement.querySelector(`input[name="question${questionIndex}"]:checked`);

        const optionLabels = questionElement.querySelectorAll('label');
        optionLabels.forEach(label => {
            label.classList.remove('correct-answer', 'incorrect-answer', 'user-selected');
        });

        if (selectedOptionInput) {
            selectedOptionInput.parentElement.classList.add('user-selected');
            if (selectedOptionInput.value === chapter.quiz[questionIndex].correctAnswer) {
                score++;
                selectedOptionInput.parentElement.classList.add('correct-answer');
            } else {
                selectedOptionInput.parentElement.classList.add('incorrect-answer');
                optionLabels.forEach(label => {
                    const radio = label.querySelector('input');
                    if (radio && radio.value === chapter.quiz[questionIndex].correctAnswer) {
                        label.classList.add('correct-answer');
                    }
                });
            }
        } else {
             optionLabels.forEach(label => {
                const radio = label.querySelector('input');
                if (radio && radio.value === chapter.quiz[questionIndex].correctAnswer) {
                    label.classList.add('correct-answer');
                }
            });
        }
    });

    const resultDiv = document.getElementById('quiz-result-div');
    const percentage = (score / chapter.quiz.length) * 100;
    resultDiv.textContent = `You scored ${score} out of ${chapter.quiz.length} (${percentage.toFixed(0)}%).`;
    resultDiv.className = 'quiz-result-div';
    resultDiv.classList.add(percentage >= 75 ? 'correct' : 'incorrect');


    if (percentage >= 0) {
        markChapterComplete(chapterId);
    }
}


function updateChapterCompletionStatus(chapterId) {
    const progress = getProgress();
    const markCompleteButton = document.getElementById('mark-complete-button');
    if (!markCompleteButton) return;

    if (progress[chapterId]?.completed) {
        markCompleteButton.textContent = 'Chapter Completed!';
        markCompleteButton.disabled = true;
        markCompleteButton.classList.add('completed');
    } else {
        markCompleteButton.textContent = 'Mark as Complete';
        markCompleteButton.disabled = false;
        markCompleteButton.classList.remove('completed');
    }
}

function setupNavigationButtons(chapterId) {
    const prevButton = document.getElementById('prev-chapter-button');
    const nextButton = document.getElementById('next-chapter-button');

    if (chapterId > 1) {
        prevButton.classList.remove('hidden');
        prevButton.onclick = () => { window.location.href = `chapter_template.html?chapter=${chapterId - 1}`; };
    } else {
        prevButton.classList.add('hidden');
    }

    if (chapterId < courseData.chapters.length) {
        nextButton.classList.remove('hidden');
        nextButton.onclick = () => { window.location.href = `chapter_template.html?chapter=${chapterId + 1}`; };
    } else {
        nextButton.classList.add('hidden');
    }
}

const PROGRESS_KEY = 'courseProgress_bydb';

function getProgress() {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
}

function saveProgress(progress) {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function markChapterComplete(chapterId) {
    const progress = getProgress();
    if (!progress[chapterId]) {
        progress[chapterId] = {};
    }
    progress[chapterId].completed = true;
    saveProgress(progress);
    console.log(`Chapter ${chapterId} marked as complete. Progress:`, getProgress());
    updateChapterCompletionStatus(chapterId);
}

function resetAllProgress() {
    if (confirm("Are you sure you want to reset all your progress? This cannot be undone.")) {
        localStorage.removeItem(PROGRESS_KEY);
        if (document.getElementById('progress-tracker-div')) {
            displayProgress();
        }
        if (document.getElementById('chapter-list-ul')) {
            document.getElementById('chapter-list-ul').innerHTML = '';
            populateChapterList();
        }
        const urlParams = new URLSearchParams(window.location.search);
        const chapterId = parseInt(urlParams.get('chapter'));
        if (chapterId && document.getElementById('mark-complete-button')) {
            updateChapterCompletionStatus(chapterId);
        }
        console.log("All progress reset.");
    }
}

function displayProgress() {
    const progressTrackerDiv = document.getElementById('progress-tracker-div');
    if (!progressTrackerDiv) return;

    const progress = getProgress();
    let completedCount = 0;
    const totalChapters = courseData.chapters.length;

    const ul = document.createElement('ul');
    courseData.chapters.forEach(chapter => {
        const li = document.createElement('li');
        let statusText = "Not Started";
        if (progress[chapter.id]?.completed) {
            statusText = "Completed";
            completedCount++;
            li.classList.add('completed');
        }
        li.textContent = `Chapter ${chapter.id}: ${chapter.title} - ${statusText}`;
        ul.appendChild(li);
    });

    const summaryP = document.createElement('p');
    summaryP.textContent = `You have completed ${completedCount} out of ${totalChapters} chapters.`;

    progressTrackerDiv.innerHTML = '';
    progressTrackerDiv.appendChild(summaryP);
    progressTrackerDiv.appendChild(ul);
}

// --- feedback.html ---
function setupFeedbackFormListener() { // Renamed from handleFeedbackForm for clarity
    const feedbackForm = document.getElementById('feedback-form');
    if (!feedbackForm) return;

    feedbackForm.addEventListener('submit', function handleFormSubmit(event) { // Named inner function
        event.preventDefault();
        const nameInput = document.getElementById('feedback-name');
        const emailInput = document.getElementById('feedback-email');
        const messageInput = document.getElementById('feedback-message');

        const nameValue = nameInput ? nameInput.value : 'N/A';
        const emailValue = emailInput ? emailInput.value : 'N/A';
        const messageValue = messageInput ? messageInput.value : 'No message';

        const recipientEmail = "feedback-bydb@example.com"; // Placeholder
        const subject = encodeURIComponent("Feedback for Be Your Own Damn Boss Course");
        const body = encodeURIComponent(
`Name: ${nameValue}
Email: ${emailValue}

Message:
${messageValue}`
        );

        const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;

        // Attempt to open mail client
        window.location.href = mailtoLink;

        const confirmationMsg = document.getElementById('feedback-confirmation');
        if (confirmationMsg) {
            confirmationMsg.classList.remove('hidden');
            // Don't reset form immediately, user might need to copy text if mailto fails
            // feedbackForm.reset();
            setTimeout(() => {
                confirmationMsg.classList.add('hidden');
            }, 4000); // Increased timeout
        }
    });
}

console.log('script.js loaded and event listeners should be active.');
