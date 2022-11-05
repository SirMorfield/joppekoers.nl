<script lang="ts">
	import logo from '../assets/logo.svg'
</script>

<div id="menu">
	<!-- <a href="/" style="heigth: 100%"> -->
	<img src={logo} id="top-logo" alt="logo" />
	<!-- </a> -->

	<a href="/">
		<div class="menuItem">Home</div>
	</a>

	<a href="contact">
		<div class="menuItem">Contact</div>
	</a>
</div>

<style>
	a {
		text-decoration: none;
		color: #dddddd;
	}
	#top-logo {
		/* max-width: 100%; */
		max-height: 100%;

		object-fit: contain;
	}
	#menu {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;
		align-items: center;
		height: 70px;
		padding: 20px 0;
	}

	.menuItem {
		font-size: 30px;
		padding: 0px 20px;
		cursor: pointer;
	}
</style>
