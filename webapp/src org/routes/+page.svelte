<script lang="ts">
    import { onMount } from "svelte";
    import { cubicOut } from "svelte/easing";
    import { fly } from "svelte/transition";

  import * as mqtt from "@kuyoonjo/tauri-plugin-mqtt";

  let uri = "mqtts://"+ MQTTUSER +":"+ MQTTPASSWORD +"@"+ MQTTBROKERURL +":8883?client_id=test";
  let topic = "data";
  let message = "hello";

  async function connect() {
    try {
      if (uri.startsWith("mqtts"))
        await mqtt.connect("xxx", uri, { skipVerification: true });
      else await mqtt.connect("xxx", uri);
    } catch (e) {
      console.log({ e });
    }
  }

  async function disconnect() {
    try {
      await mqtt.disconnect("xxx");
    } catch (e) {
      console.log({ e });
    }
  }

  async function publish() {
    try {
      await mqtt.publish("xxx", topic, 0, false, message);
    } catch (e) {
      console.log({ e });
    }
  }

  async function subscribe() {
    try {
      await mqtt.subscribe("xxx", topic, 0);
    } catch (e) {
      console.log({ e });
    }
  }

  async function unsubscribe() {
    try {
      await mqtt.unsubscribe("xxx", topic);
    } catch (e) {
      console.log({ e });
    }
  }

  onMount(() => {
    mqtt.listen((x) => {
      console.log(x.payload);
    });
  });

let showImage: boolean = false;
onMount(()=>{
    showImage = true;
});
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<div class="flex flex-col items-center justify-center h-screen">
    {#if showImage === true}
        <img src="/Logo.png" alt="Logo" class="h-52 z-0" in:fly={{duration: 1000, easing: cubicOut, x:0, y:'100%'}}>
    {:else}
        <div class="h-52"></div>
    {/if}
    <div class="flex flex-col bg-stone-900 z-10 pb-10 mt-3">
        <h1 class="font-bold text-2xl pb-5">Hi-Horizon Racing Team Telemetry Dashboard</h1>
        <form class="flex flex-col space-y-3 w-1/2 self-center" method="POST" action="?/login" on:submit={connect}>
            <input class="bg-white text-stone-900 rounded text-center" placeholder="username" name="username" value="admin">
            <input type="password" class="bg-white text-stone-900 rounded text-center" placeholder="password" name="password" value="">
            <button type="submit" class="bg-red-600 hover:bg-red-500 rounded">Login</button>
        </form>
    </div>
</div>

<main class="container">
  <div class="row">
    <button on:click={connect}> Connect </button>
    <button on:click={disconnect}> Disconnect </button>
  </div>
  <div class="row">
    <input placeholder="topic" bind:value={topic} />
  </div>
  <div class="row">
    <button on:click={subscribe}> Subscribe </button>
    <button on:click={unsubscribe}> Unsubscribe </button>
    <button on:click={publish}> Publish </button>
  </div>
</main>