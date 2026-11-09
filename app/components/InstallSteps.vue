<!-- SPDX-License-Identifier: GPL-3.0-or-later -->
<script setup lang="ts">
/** Installing the OpenMixer packages and a first run. Shared by the home page and /get-it. */
const { t } = useI18n();
const fedora = [
  'sudo dnf install https://www.openmixer.org/rpm/openmixer-release.noarch.rpm',
  'sudo dnf install plugin-hostd-full',
];
const debian = [
  'curl -fsSL -o /tmp/openmixer-release.deb https://www.openmixer.org/deb/openmixer-release.deb',
  'sudo apt install /tmp/openmixer-release.deb',
  'sudo apt update',
  'sudo apt install plugin-hostd-full',
];
/** The same stack on a machine with no screen: the panel is a recommended package, left out by the standard switch. */
const fedoraHeadless = ['sudo dnf install --setopt=install_weak_deps=False plugin-hostd-full'];
const debianHeadless = ['sudo apt install --no-install-recommends plugin-hostd-full'];
const tryIt = computed(() => [
  `# ${t('common.install.tryScan')}`,
  'omx-clap-scan',
  '',
  ...t('common.install.tryHostd').split('\n').map((l) => `# ${l}`),
  'plugin-hostd -n -p 5555 -f 5556',
]);
const tabs = [
  { label: 'Fedora', value: 'fedora', slot: 'fedora' as const },
  { label: 'Debian · Raspberry Pi OS · Zynthian', value: 'debian', slot: 'debian' as const },
];
const packages = computed(() => [
  ['plugin-hostd-full', t('common.install.pkgFull')],
  ['omx-clap-host', t('common.install.pkgClapHost')],
  ['plugin-hostd', t('common.install.pkgHostd')],
  ['-devel · -dev', t('common.install.pkgDevel')],
] as const);

/** Open on the reader's own family when the browser says which one it is. */
const distro = ref('fedora');
onMounted(() => {
  if (/Debian|Raspbian|Ubuntu/i.test(navigator.userAgent)) distro.value = 'debian';
});
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-lg border border-edge bg-surface">
      <UTabs
        v-model="distro"
        :items="tabs"
        variant="link"
        color="primary"
        :ui="{ list: 'border-b border-edge px-2 overflow-x-auto', trigger: 'flex-none py-3', content: 'p-5' }"
      >
        <template #fedora>
          <p class="mb-4 text-sm text-ink-dim">{{ t('common.install.fedora') }}</p>
          <CodeBlock :lines="fedora" />
          <p class="mb-2 mt-4 text-sm text-ink-dim">{{ t('common.install.headless') }}</p>
          <CodeBlock :lines="fedoraHeadless" />
        </template>
        <template #debian>
          <p class="mb-4 text-sm text-ink-dim">{{ t('common.install.debian') }}</p>
          <CodeBlock :lines="debian" />
          <p class="mb-2 mt-4 text-sm text-ink-dim">{{ t('common.install.headless') }}</p>
          <CodeBlock :lines="debianHeadless" />
        </template>
      </UTabs>
    </div>

    <div class="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      <div v-for="[name, what] in packages" :key="name" class="rounded-lg border border-edge bg-surface p-4">
        <p class="font-mono text-sm text-ink">{{ name }}</p>
        <p class="mt-1 text-sm text-ink-dim">{{ what }}</p>
      </div>
    </div>
    <p class="mt-4 text-sm leading-relaxed text-ink-faint">
      {{ t('common.install.signed') }}
      <a href="https://www.openmixer.org/rpm/RPM-GPG-KEY-openmixer" class="text-accent hover:underline">RPM-GPG-KEY-openmixer</a>,
      <a href="https://www.openmixer.org/deb/openmixer.asc" class="text-accent hover:underline">openmixer.asc</a>.
    </p>

    <div class="mt-14">
      <SectionHead :eyebrow="t('common.install.tryEyebrow')" :title="t('common.install.tryTitle')" />
      <CodeBlock :lines="tryIt" />
    </div>
  </div>
</template>
