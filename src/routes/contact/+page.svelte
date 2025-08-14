<script lang="ts">
  import { Mail, Phone, MapPin, Clock, Send } from 'lucide-svelte';
  
  let contactForm = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };
  
  let isSubmitting = false;
  let submitMessage = '';
  
  const handleSubmit = async () => {
    isSubmitting = true;
    
    // TODO: Implement actual form submission
    console.log('Contact form submission:', contactForm);
    
    // Simulate API call
    setTimeout(() => {
      isSubmitting = false;
      submitMessage = 'Thank you for your message! We\'ll get back to you within 24 hours.';
      
      // Reset form
      contactForm = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      };
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        submitMessage = '';
      }, 5000);
    }, 1000);
  };
</script>

<svelte:head>
  <title>Contact Us | OffMarketPrime</title>
  <meta name="description" content="Get in touch with OffMarketPrime for property inquiries, support, or partnership opportunities. We're here to help you find your perfect rental home." />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://offmarketprime.co.uk/contact" />
  </svelte:head>

<main class="min-h-screen bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Hero Section -->
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Get In Touch</h1>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Have a question about a property? Need help with your search? Want to partner with us? We're here to help.
      </p>
    </div>

    <div class="grid lg:grid-cols-3 gap-8">
      <!-- Contact Information -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm p-8 sticky top-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
          
          <div class="space-y-6">
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail class="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Email</h3>
                <p class="text-gray-600">hello@offmarketprime.co.uk</p>
                <p class="text-sm text-gray-500 mt-1">We typically respond within 2-4 hours</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone class="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Phone</h3>
                <p class="text-gray-600">+44 7506 000 000</p>
                <p class="text-sm text-gray-500 mt-1">Mon-Fri, 9:00 AM - 6:00 PM</p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin class="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Address</h3>
                <p class="text-gray-600">
                  23 Bridge Place<br>
                  Southwark<br>
                  London, SE1 4DF
                </p>
              </div>
            </div>
            
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock class="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 mb-1">Business Hours</h3>
                <div class="text-gray-600 text-sm">
                  <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday: 10:00 AM - 4:00 PM</p>
                  <p>Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Contact Options -->
          <div class="mt-8 pt-6 border-t border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-4">Quick Contact</h3>
            <div class="space-y-2">
              <a 
                href="mailto:hello@offmarketprime.co.uk" 
                class="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Mail class="w-4 h-4 mr-2" />
                Send us an email
              </a>
              <a 
                href="tel:+447506000000" 
                class="flex items-center text-green-600 hover:text-green-700 transition-colors"
              >
                <Phone class="w-4 h-4 mr-2" />
                Call us directly
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Form -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-xl shadow-sm p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
          
          {#if submitMessage}
            <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-green-700">{submitMessage}</p>
            </div>
          {/if}
          
          <form on:submit|preventDefault={handleSubmit} class="space-y-6">
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label for="contact-name" class="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  bind:value={contactForm.name}
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your full name"
                />
              </div>
              
              <div>
                <label for="contact-email" class="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  bind:value={contactForm.email}
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>
            
            <div class="grid md:grid-cols-2 gap-6">
              <div>
                <label for="contact-phone" class="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  bind:value={contactForm.phone}
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+44 7123 456789"
                />
              </div>
              
              <div>
                <label for="contact-subject" class="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="contact-subject"
                  bind:value={contactForm.subject}
                  required
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a subject</option>
                  <option value="property-inquiry">Property Inquiry</option>
                  <option value="technical-support">Technical Support</option>
                  <option value="partnership">Partnership Opportunity</option>
                  <option value="feedback">Feedback or Suggestion</option>
                  <option value="press-media">Press & Media</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            
            <div>
              <label for="contact-message" class="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                id="contact-message"
                bind:value={contactForm.message}
                required
                rows="6"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please tell us how we can help you..."
              ></textarea>
            </div>
            
            <div class="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if isSubmitting}
                  <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                {:else}
                  <Send class="w-4 h-4 mr-2" />
                  Send Message
                {/if}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="mt-16">
      <div class="bg-white rounded-xl shadow-sm p-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
        
        <div class="grid md:grid-cols-2 gap-8">
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">How do I arrange a property viewing?</h3>
            <p class="text-gray-600 mb-4">You can request a viewing directly through each property listing page, or contact us with your requirements and we can help arrange multiple viewings for you.</p>
            
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Are there any fees for using OffMarketPrime?</h3>
            <p class="text-gray-600 mb-4">No, OffMarketPrime is completely free for renters. We make our platform available at no cost to help you find your perfect home.</p>
          </div>
          
          <div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">How often is property information updated?</h3>
            <p class="text-gray-600 mb-4">We update property listings and availability in real-time. Our team works closely with property partners to ensure all information is current and accurate.</p>
            
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Can I list my property on OffMarketPrime?</h3>
            <p class="text-gray-600">If you're a property developer or letting agent, please contact us about partnership opportunities. We work with verified professionals to maintain quality standards.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</main> 