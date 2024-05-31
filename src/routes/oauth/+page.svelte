<script lang="ts">
	import { goto } from '$app/navigation';

	let urlParams = new URLSearchParams(window.location.hash);
	// console.log(urlParams);
	let token = urlParams.get('#access_token');
	if (token) {
		// console.log(token);
		localStorage.setItem('token', token);
		goto('/');
	} else {
		console.error('User Declined Access');
		goto('/');
	}
</script>
