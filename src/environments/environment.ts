// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  /**
   * Base URL for the ApplicazioniuWebCloud backend. Override this per environment to
   * target a different deployment of the API gateway.
   */
  apiBaseUrl: 'https://applicazioniuwebcloud.example.com',
  /**
   * Logical endpoints used by the Angular data services. Keeping the paths in one
   * place makes it easier to point the UI at different backend stacks without
   * touching the feature code.
   */
  endpoints: {
    auth: '/auth',
    hackathons: '/hackathons',
    participants: '/participants',
    teams: '/teams',
    submissions: '/submissions'
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
