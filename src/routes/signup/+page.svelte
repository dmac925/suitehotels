<script lang="ts">
  import { Shield, Eye, Users, TrendingUp } from 'lucide-svelte';
  
  let email = '';
  let firstName = '';
  let lastName = '';
  let password = '';
  let confirmPassword = '';
  let agreeToTerms = false;
  let isLoading = false;
  
  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (!agreeToTerms) {
      alert('Please agree to terms and conditions');
      return;
    }
    
    isLoading = true;
    // TODO: Implement actual signup logic
    setTimeout(() => {
      isLoading = false;
      // Redirect to onboarding flow after successful signup
      window.location.href = '/onboarding';
    }, 2000);
  };
  
  const benefits = [
    {
      icon: Eye,
      title: 'Exclusive Access',
      description: 'View complete property details and contact information'
    },
    {
      icon: Shield,
      title: 'First to Know',
      description: 'Get notified of new off-market properties immediately'
    },
    {
      icon: Users,
      title: 'Direct Contact',
      description: 'Connect directly with property owners and agents'
    },
    {
      icon: TrendingUp,
      title: 'Market Insights',
      description: 'Access detailed market analysis and investment data'
    }
  ];
</script>

<svelte:head>
  <title>Join OffMarketEdit - Exclusive Access to Luxury Properties</title>
  <meta name="description" content="Sign up for exclusive access to off-market luxury properties in London. Join our premium community of property investors and buyers." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-luxury-pearl to-white py-12">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      
      <!-- Left Side - Benefits -->
      <div class="lg:pr-8">
        <div class="mb-8">
          <h1 class="luxury-heading text-4xl lg:text-5xl mb-4">
            Join Our Exclusive
            <span class="text-luxury-gold block">Property Community</span>
          </h1>
          <p class="text-xl luxury-text">
            Gain instant access to London's most exclusive off-market properties. 
            Join thousands of discerning buyers and investors.
          </p>
        </div>
        
        <div class="space-y-6">
          {#each benefits as benefit}
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-luxury-champagne rounded-lg">
                  <svelte:component this={benefit.icon} class="h-6 w-6 text-luxury-gold" />
                </div>
              </div>
              <div>
                <h3 class="luxury-heading text-lg mb-1">{benefit.title}</h3>
                <p class="luxury-text">{benefit.description}</p>
              </div>
            </div>
          {/each}
        </div>
        
        <!-- Trust indicators -->
        <div class="mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <div class="flex items-center justify-between">
            <div class="text-center">
              <div class="luxury-heading text-2xl text-luxury-gold">50+</div>
              <div class="text-sm text-gray-600">Trusted Agents</div>
            </div>
            <div class="text-center">
              <div class="luxury-heading text-2xl text-luxury-gold">£2.5B+</div>
              <div class="text-sm text-gray-600">Properties Listed</div>
            </div>
            <div class="text-center">
              <div class="luxury-heading text-2xl text-luxury-gold">1000+</div>
              <div class="text-sm text-gray-600">Happy Members</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Side - Form -->
      <div class="luxury-card rounded-2xl p-8 lg:p-10">
        <div class="mb-8">
          <h2 class="luxury-heading text-2xl mb-2">Create Your Account</h2>
          <p class="luxury-text">Start your journey to exclusive property access</p>
        </div>
        
        <form on:submit={handleSubmit} class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                bind:value={firstName}
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors"
                placeholder="John"
              />
            </div>
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                bind:value={lastName}
                required
                class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors"
                placeholder="Smith"
              />
            </div>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              bind:value={email}
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors"
              placeholder="john@example.com"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              bind:value={password}
              required
              minlength="8"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors"
              placeholder="Minimum 8 characters"
            />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              bind:value={confirmPassword}
              required
              minlength="8"
              class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-colors"
              placeholder="Confirm your password"
            />
          </div>
          
          <div class="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agreeToTerms"
              bind:checked={agreeToTerms}
              required
              class="mt-1 h-4 w-4 text-luxury-gold focus:ring-luxury-gold border-gray-300 rounded"
            />
            <label for="agreeToTerms" class="text-sm text-gray-600">
              I agree to the <a href="/terms" class="text-luxury-gold hover:underline">Terms of Service</a> 
              and <a href="/privacy" class="text-luxury-gold hover:underline">Privacy Policy</a>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            class="w-full luxury-button rounded-md py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-600">
            Already have an account? 
            <a href="/login" class="text-luxury-gold font-medium hover:underline">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</div> 