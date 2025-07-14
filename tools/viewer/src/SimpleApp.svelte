<script>
  let status = 'Starting...';
  
  // Simple test without async
  setTimeout(() => {
    status = 'Loaded!';
  }, 1000);
</script>

<div class="p-8 bg-gray-900 text-white min-h-screen">
  <h1 class="text-2xl mb-4">Simple Test</h1>
  <p>Status: {status}</p>
</div>