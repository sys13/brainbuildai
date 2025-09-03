import type { FEATURES } from './feature-template-utils'

interface Template {
	description: string
	features: (typeof FEATURES)[number]['name'][]
	name: string
	pages: { description: string; name: string }[]
}

export const APP_TEMPLATES: Template[] = [
	{
		description:
			'Create a fitness website to promote your gym, classes, and personal training services.',
		features: ['Workout Plans', 'Nutrition', 'Progress Tracking', 'Community'],
		name: 'Fitness',
		pages: [
			{
				description:
					'Overview of fitness plans and features offered by the app.',
				name: 'Home Page',
			},
			{
				description: 'Detailed information and schedules for workout plans.',
				name: 'Workout Plan Page',
			},
			{
				description: 'Instructions and videos for specific exercises.',
				name: 'Exercise Detail Page',
			},
			{
				description: 'Information and tracking for nutrition and diet.',
				name: 'Nutrition Page',
			},
			{
				description: 'User’s personal information and fitness progress.',
				name: 'User Profile Page',
			},
			{
				description:
					'Visual representation of fitness progress and achievements.',
				name: 'Progress Tracking Page',
			},
			{
				description: 'Interaction and support from other users.',
				name: 'Community Page',
			},
			{
				description: 'Application settings and configurations.',
				name: 'Settings Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
		],
	},
	{
		description:
			'Start a blog and share your thoughts and ideas with the world.',
		features: ['Home', 'About', 'Feed', 'Category'],
		name: 'Blog',
		pages: [
			{
				description:
					'Displays recent articles, featured posts, and possibly a welcome message.',
				name: 'Home Page',
			},
			{
				description:
					'Displays a single blog post with comments and social sharing options.',
				name: 'Article Page',
			},
			{
				description: 'Lists articles by category.',
				name: 'Category Page',
			},
			{
				description: 'Lists articles by tags.',
				name: 'Tag Page',
			},
			{
				description: 'Information about the blog and its authors.',
				name: 'About Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
			{
				description: 'Displays articles by month or year.',
				name: 'Archive Page',
			},
			{
				description: 'Displays search results for user queries.',
				name: 'Search Results Page',
			},
		],
	},
	{
		description:
			'Sell products online and manage your store with an e-commerce website.',
		features: ['Cart', 'Checkout', 'Wishlist', 'Product', 'Products List'],
		name: 'E-commerce',
		pages: [
			{
				description: 'Displays featured products, promotions, and categories.',
				name: 'Home Page',
			},
			{
				description:
					'Detailed information about a single product, including reviews and related products.',
				name: 'Product Page',
			},
			{
				description: 'Lists products by category.',
				name: 'Category Page',
			},
			{
				description: 'Displays search results for user queries.',
				name: 'Search Results Page',
			},
			{
				description: 'Shows items added to the shopping cart.',
				name: 'Cart Page',
			},
			{
				description:
					'Allows users to enter shipping and payment information to complete their purchase.',
				name: 'Checkout Page',
			},
			{
				description:
					'Displays user profile, order history, and account settings.',
				name: 'User Account Page',
			},
			{
				description: 'Information about the company.',
				name: 'About Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
		],
	},
	{
		description:
			'Showcase your work and projects with a beautiful portfolio website.',
		features: ['Personal Projects'],
		name: 'Portfolio',
		pages: [
			{
				description: 'Overview of featured projects and an introduction.',
				name: 'Home Page',
			},
			{
				description:
					'Detailed information about a specific project, including images and descriptions.',
				name: 'Project Page',
			},
			{
				description: 'Information about the portfolio owner.',
				name: 'About Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
			{
				description:
					'Blog posts related to the portfolio owner’s work and experiences.',
				name: 'Blog Page',
			},
			{
				description: 'Visual showcase of projects or artwork.',
				name: 'Gallery Page',
			},
			{
				description: 'Detailed resume or CV of the portfolio owner.',
				name: 'Resume Page',
			},
		],
	},
	{
		description:
			'Create a community forum and engage with your audience online.',
		features: [
			'Category',
			'Threads',
			'Posts',
			'Moderation',
			'Search',
			'Notifications',
			'Profile',
			'Settings',
		],
		name: 'Forum',
		pages: [
			{
				description: 'Overview of forum categories and recent posts.',
				name: 'Home Page',
			},
			{
				description: 'Lists threads within a specific category.',
				name: 'Category Page',
			},
			{
				description: 'Displays a single thread with posts and replies.',
				name: 'Thread Page',
			},
			{
				description: "User's personal information, posts, and activity.",
				name: 'User Profile Page',
			},
			{
				description: 'Displays search results for user queries.',
				name: 'Search Results Page',
			},
			{
				description: 'Overview of user activity and notifications.',
				name: 'User Dashboard',
			},
			{
				description: 'Forum rules and guidelines.',
				name: 'Rules Page',
			},
			{
				description: 'Information about the forum.',
				name: 'About Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
		],
	},
	{
		description:
			'Create an admin dashboard or control panel for managing your website.',
		features: ['Manage Users', 'Site Analytics', 'Settings'],
		name: 'Admin',
		pages: [
			{
				description: 'Overview of site analytics and key metrics.',
				name: 'Dashboard',
			},
			{
				description: 'Create, update, and delete user accounts and profiles.',
				name: 'Manage Users',
			},
			{
				description:
					'Monitor and analyze user behavior, traffic, and performance data.',
				name: 'Site Analytics',
			},
			{
				description: 'Application settings and configurations.',
				name: 'Settings',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
		],
	},
	{
		description:
			'Promote your SaaS product and generate leads with a marketing website.',
		features: [
			'Home',
			'Features',
			'Pricing',
			'Testimonials',
			'Contact',
			'Newsletter',
		],
		name: 'SaaS Marketing',
		pages: [
			{
				description: 'Overview of the SaaS product and its key features.',
				name: 'Home Page',
			},
			{
				description: 'Detailed information about the product features.',
				name: 'Features Page',
			},
			{
				description: 'Pricing plans and options for the product.',
				name: 'Pricing Page',
			},
			{
				description: 'Customer reviews and feedback about the product.',
				name: 'Testimonials Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
			{
				description: 'Subscription form for receiving updates and news.',
				name: 'Newsletter Page',
			},
			{
				description: 'Information about the company and its mission.',
				name: 'About Page',
			},
		],
	},
	{
		description: 'Read the latest news and articles from around the world.',
		features: [
			'Home',
			'Article',
			'Category',
			'Tag',
			'About',
			'Contact',
			'Archive',
			'Search',
		],
		name: 'News Portal',
		pages: [
			{
				description:
					'Displays top stories, breaking news, and featured articles.',
				name: 'Home Page',
			},
			{
				description: 'Detailed view of a single news article.',
				name: 'Article Page',
			},
			{
				description:
					'Lists articles by category, such as politics, sports, or entertainment.',
				name: 'Category Page',
			},
			{
				description: 'Lists articles by tags.',
				name: 'Tag Page',
			},
			{
				description: 'Displays articles by month or year.',
				name: 'Archive Page',
			},
			{
				description: 'Displays search results for user queries.',
				name: 'Search Results Page',
			},
			{
				description: 'Information about the news portal and its team.',
				name: 'About Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
			{
				description: 'Displays opinion pieces and editorials.',
				name: 'Opinion Page',
			},
			{
				description: 'Lists videos, podcasts, and other multimedia content.',
				name: 'Multimedia Page',
			},
		],
	},
	{
		description:
			'Manage medical appointments, prescriptions, and patient records.',
		features: [
			'Home',
			'Patient Profile',
			'Appointment',
			'Medical Records',
			'Prescription',
			'Doctor Profile',
			'Search Results',
			'Contact',
			'About',
		],
		name: 'Healthcare',
		pages: [
			{
				description: 'Overview of services and features offered by the app.',
				name: 'Home Page',
			},
			{
				description:
					'Detailed information about a patient, including medical history and appointments.',
				name: 'Patient Profile Page',
			},
			{
				description: 'Scheduling and managing medical appointments.',
				name: 'Appointment Page',
			},
			{
				description: 'Access to patient medical records and history.',
				name: 'Medical Records Page',
			},
			{
				description: 'Information about patient prescriptions and medications.',
				name: 'Prescription Page',
			},
			{
				description:
					'Information about doctors, including specialties and availability.',
				name: 'Doctor Profile Page',
			},
			{
				description: 'Displays search results for user queries.',
				name: 'Search Results Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
			{
				description: 'Information about the healthcare app and its mission.',
				name: 'About Page',
			},
		],
	},
	{
		description: 'Find job listings and career opportunities.',
		features: [
			'Home',
			'Job Listing',
			'Job Detail',
			'Search Results',
			'Company Profile',
			'User Profile',
			'Application',
			'About',
			'Contact',
		],
		name: 'Job Portal',
		pages: [
			{
				description: 'Overview of job listings and search options.',
				name: 'Home Page',
			},
			{
				description: 'List of available jobs.',
				name: 'Job Listing Page',
			},
			{
				description: 'Detailed information about a specific job.',
				name: 'Job Detail Page',
			},
			{
				description: 'Displays search results for user queries.',
				name: 'Search Results Page',
			},
			{
				description: 'Information about companies posting jobs.',
				name: 'Company Profile Page',
			},
			{
				description: 'User’s personal information and job applications.',
				name: 'User Profile Page',
			},
			{
				description: 'Details and status of job applications.',
				name: 'Application Page',
			},
			{
				description: 'Information about the job portal.',
				name: 'About Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
		],
	},
	{
		description: 'Listen to your favorite music and discover new artists.',
		features: [
			'Home',
			'Playlist',
			'Album',
			'Artist',
			'Search',
			'User Profile',
			'Settings',
			'About',
			'Contact',
		],
		name: 'Music Streaming',
		pages: [
			{
				description: 'Overview of featured music and playlists.',
				name: 'Home Page',
			},
			{
				description: 'User-created and recommended playlists.',
				name: 'Playlist Page',
			},
			{
				description: 'Detailed information about a specific album.',
				name: 'Album Page',
			},
			{
				description: 'Information about music artists and their works.',
				name: 'Artist Page',
			},
			{
				description: 'Displays search results for user queries.',
				name: 'Search Results Page',
			},
			{
				description: 'User’s personal information and activity.',
				name: 'User Profile Page',
			},
			{
				description: 'Application settings and configurations.',
				name: 'Settings Page',
			},
			{
				description: 'Information about the music streaming app.',
				name: 'About Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
		],
	},
	{
		description:
			'Build a software-as-a-service (SaaS) product for managing subscriptions and user accounts.',
		features: [
			'Dashboard',
			'User Profile',
			'Account Settings',
			'Billing',
			'Subscription Management',
			'Usage Analytics',
			'Admin Panel',
			'User Management',
			'Role Management',
		],
		name: 'SaaS Application',
		pages: [
			{
				description: 'Introduction to the SaaS product and its features.',
				name: 'Home Page',
			},
			{
				description: 'Overview of user’s activity and key metrics.',
				name: 'Dashboard',
			},
			{
				description: 'User’s personal information and settings.',
				name: 'User Profile Page',
			},
			{
				description: 'Settings and preferences for user account.',
				name: 'Account Settings Page',
			},
			{
				description: 'Details about user’s billing and payment history.',
				name: 'Billing Page',
			},
			{
				description: 'Options to manage user subscriptions and plans.',
				name: 'Subscription Management Page',
			},
			{
				description: 'Analytics and reports on user activity and usage.',
				name: 'Usage Analytics Page',
			},
			{
				description:
					'Administrative controls and settings for the application.',
				name: 'Admin Panel',
			},
			{
				description: 'Manage user accounts and roles.',
				name: 'User Management Page',
			},
			{
				description: 'Define and manage user roles and permissions.',
				name: 'Role Management Page',
			},
		],
	},
	{
		description:
			'Build a social network or community website for connecting with others.',
		features: ['Feed', 'Friends', 'Messages', 'Notifications', 'Profile'],
		name: 'Social Network',
		pages: [
			{
				description: 'Displays posts from friends or followed users.',
				name: 'Home Page/Feed',
			},
			{
				description: "User's personal information, posts, and activity.",
				name: 'Profile Page',
			},
			{
				description: 'Lists of friends or followers.',
				name: 'Friends/Followers Page',
			},
			{
				description: 'Private messaging between users.',
				name: 'Messages Page',
			},
			{
				description:
					'Updates on user activity, such as likes, comments, and new followers.',
				name: 'Notifications Page',
			},
			{
				description: 'Displays search results for user queries.',
				name: 'Search Results Page',
			},
			{
				description: 'User account and privacy settings.',
				name: 'Settings Page',
			},
			{
				description: 'Lists and manages groups or communities.',
				name: 'Groups/Communities Page',
			},
			{
				description: 'Information on upcoming events and the ability to RSVP.',
				name: 'Events Page',
			},
		],
	},

	{
		description: 'Book flights, hotels, and car rentals for your next trip.',
		features: [
			'Search',
			'Booking',
			'User Account',
			'Contact',
			'About',
			'Permissions',
			'Product Features',
			'Pricing',
			'FAQ',
			'Support',
			'Knowledge Base',
			'API Documentation',
		],
		name: 'Travel Booking App',
		pages: [
			{
				description: 'Overview of travel deals and search options.',
				name: 'Home Page',
			},
			{
				description: 'Displays search results for user queries.',
				name: 'Search Results Page',
			},
			{
				description: 'Details and booking options for flights.',
				name: 'Flight Booking Page',
			},
			{
				description: 'Details and booking options for hotels.',
				name: 'Hotel Booking Page',
			},
			{
				description: 'Details and booking options for car rentals.',
				name: 'Car Rental Page',
			},
			{
				description: 'User profile and account management.',
				name: 'User Account Page',
			},
			{
				description: 'Confirmation details for booked travel services.',
				name: 'Booking Confirmation Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
			{
				description: 'Information about the travel booking app.',
				name: 'About Page',
			},
			{
				description: 'Set and manage permissions for user roles.',
				name: 'Permissions Page',
			},
			{
				description: 'Details about the product features and functionalities.',
				name: 'Product Features Page',
			},
			{
				description: 'Information on pricing plans and options.',
				name: 'Pricing Page',
			},
			{
				description: 'Frequently asked questions about the product.',
				name: 'FAQ Page',
			},
			{
				description: 'Options for getting support and assistance.',
				name: 'Support Page',
			},
			{
				description: 'Articles and guides on using the product.',
				name: 'Knowledge Base',
			},
			{
				description: 'Documentation for developers using the API.',
				name: 'API Documentation',
			},
		],
	},
	{
		description: 'Create a documentation website for your project or product.',
		features: ['Search', 'Programming Language Switcher'],
		name: 'Documentation',
		pages: [
			{
				description: 'Overview of the documentation and available guides.',
				name: 'Home Page',
			},
			{
				description: 'Detailed information about a specific topic or feature.',
				name: 'Guide Page',
			},
			{
				description: 'Lists all available guides and documentation.',
				name: 'Documentation Page',
			},
			{
				description: 'Displays search results for user queries.',
				name: 'Search Results Page',
			},
			{
				description: 'Information about the app or software.',
				name: 'About Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
		],
	},
	{
		description: 'Offer online courses and learning materials to students.',
		features: [
			'Home',
			'Course',
			'Lesson',
			'Category',
			'Search Results',
			'User Dashboard',
			'Profile',
			'Forum/Discussion',
			'About',
			'Contact',
		],
		name: 'Education',
		pages: [
			{
				description: 'Overview of courses, featured content, and promotions.',
				name: 'Home Page',
			},
			{
				description:
					'Detailed information about a specific course, including syllabus and reviews.',
				name: 'Course Page',
			},
			{
				description:
					'Content of a single lesson, including videos, quizzes, and assignments.',
				name: 'Lesson Page',
			},
			{
				description: 'Lists courses by category.',
				name: 'Category Page',
			},
			{
				description: 'Displays search results for user queries.',
				name: 'Search Results Page',
			},
			{
				description:
					'Overview of user progress, enrolled courses, and achievements.',
				name: 'User Dashboard',
			},
			{
				description: "User's personal information and activity.",
				name: 'Profile Page',
			},
			{
				description: 'Allows users to discuss topics and ask questions.',
				name: 'Forum/Discussion Page',
			},
			{
				description: 'Information about the platform and its mission.',
				name: 'About Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
		],
	},
	{
		description: 'Promote and manage events with an event management website.',
		features: [
			'Home',
			'Event',
			'Ticket Booking',
			'Search Results',
			'User Account',
			'Organizer Profile',
			'Contact',
			'About',
		],
		name: 'Event',
		pages: [
			{
				description: 'Overview of upcoming events and search options.',
				name: 'Home Page',
			},
			{
				description: 'Detailed information about a specific event.',
				name: 'Event Page',
			},
			{
				description: 'Options for booking tickets to events.',
				name: 'Ticket Booking Page',
			},
			{
				description: 'Displays search results for user queries.',
				name: 'Search Results Page',
			},
			{
				description: 'User profile and account management.',
				name: 'User Account Page',
			},
			{
				description: 'Information about event organizers.',
				name: 'Organizer Profile Page',
			},
			{
				description: 'Contact form and contact details.',
				name: 'Contact Page',
			},
			{
				description: 'Information about the event management app.',
				name: 'About Page',
			},
		],
	},
]
