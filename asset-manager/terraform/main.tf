terraform {
  required_providers {
    vercel = {
      source = "vercel/vercel"
    }
  }
}

locals {
  envs = { for tuple in regexall("(.*)=(.*)", file("../.env.local")) : tuple[0] => sensitive(tuple[1]) }
}


provider "vercel" {
  # Or omit this for the api_token to be read
  # from the VERCEL_API_TOKEN environment variable
  api_token = local.envs["VERCEL_API_TOKEN"]
}


resource "vercel_project" "mc-asset-manager" {
  name      = "mc-asset-manager"
  framework = "create-react-app"
  git_repository = {
    type = "github"
    #sad but true, you will need to fork it into your private github org.
    repo = "phofmann/asset-manager"
  }
  root_directory = "asset-manager"
  build_command    = "yarn build"
  output_directory = "public"
  environment = [{
    key    = "CUSTOM_VIEW_ID"
    target = ["production", "preview", "development"]
    value = local.envs["CUSTOM_VIEW_ID"]
  }, {
    key = "APPLICATION_URL"
    target = ["production", "preview", "development"]
    value = local.envs["APPLICATION_URL"]
  }, {
    key = "CLOUD_IDENTIFIER"
    target = ["production", "preview", "development"]
    value = local.envs["CLOUD_IDENTIFIER"]
  }]
}
