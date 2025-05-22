// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  typescript: { strict: true },

  modules: [
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@vueuse/nuxt",
    "nuxt-primevue",
    "dayjs-nuxt",
    "nuxt-icon",
  ],

  css: [
    "@/assets/css/sundra.css",
    "@/assets/css/sundra-icons.css",
    "@/assets/css/theme/theme.css",
    "primeflex/primeflex.css",
    "primeicons/primeicons.css",
  ],

  pinia: {
    //autoImports: ['defineStore', 'acceptHMRUpdate'],
  },

  primevue: {
    options: {
      ripple: true,
      cssLayer: true,
    },
    components: {
      prefix: "Prime",
      include: [
        "DatePicker",
        "Checkbox",
        "Select",
        "InputGroup",
        "InputText",
        "InputNumber",
        "InputMask",
        "MultiSelect",
        "Password",
        "RadioButton",
        "SelectButton",
        "Textarea",
        "Button",
        "ToggleButton",
        "SplitButton",
        "DataTable",
        "Column",
        "ColumnGroup",
        "Row",
        "Divider",
        "ScrollPanel",
        "IconField",
        "InputIcon",
        "Tabs",
        "TabPanel",
        "ConfirmDialog",
        "ConfirmationService",
        "Popover",
        "Dialog",
        "DynamicDialog",
        "DialogService",
        "ContextMenu",
        "Menu",
        "MenuItem",
        "MenuItemCommandEvent",
        "Message",
        "Toast",
        "ToastService",
        "Image",
        "Avatar",
        "Badge",
        "OverlayBadge",
        "BlockUI",
        "Inplace",
        "Skeleton",
        "ProgressBar",
        "ProgressSpinner",
        "Tag",
        "ToggleSwitch",
      ],
    },
    directives: {
      prefix: "Prime",
      include: [
        "Ripple",
        "Tooltip",
        "FocusTrap",
        "StyleClass",
      ] /* Used as v-pripple and v-ptooltip */,
    },
  },

  build: {
    transpile: ["primevue"],
  },

  app: {
    head: {
      title: "Sundra.io",
      link: [
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Manrope:wght@200..800&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900",
        },
        {
          rel: "dns-prefetch",
          href: "//fonts.gstatic.com",
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      debug: process.env.DEBUG == "true",
      downloadUrl: process.env.URL_DOWNLOAD,
      streamingUrl: process.env.URL_STREAMING,
      backendUrl: process.env.URL_BACKEND,
      frontendUrl: process.env.URL_FRONTEND,
      pusher: {
        key: process.env.PUSHER_APP_KEY,
        cluster: process.env.PUSHER_APP_CLUSTER,
        endpoint: process.env.PUSHER_AUTH_ENDPOINT,
      },
      stripe_api: {
        key: process.env.STRIPE_KEY,
        plans: {
          creator: process.env.SUBSCRIPTION_CREATOR_PRODUCT,
          producer: process.env.SUBSCRIPTION_PRODUCER_PRODUCT,
          broadcaster: process.env.SUBSCRIPTION_BROADCASTER_PRODUCT,
          corporate: process.env.SUBSCRIPTION_CORPORATE_PRODUCT,
          // Legacy
          personal: process.env.SUBSCRIPTION_TRANSCRIPTION_PERSONAL,
          business: process.env.SUBSCRIPTION_TRANSCRIPTION_BUSINESS,
          enterprise: process.env.SUBSCRIPTION_TRANSCRIPTION_ENTERPRISE,
        },
        legacy: ["Personal", "Business", "Enterprise"],
      },
    },
  },

  compatibilityDate: "2024-08-28",
});
