# Loaded only by `engine/scripts/jekyll.sh serve`. GitHub Pages redirects the baseurl without its
# trailing slash (/apps) to /apps/, but Jekyll's preview server answers it with a 404. This makes the
# preview server redirect it too.
require "webrick"
require "yaml"

module ServeBaseurlSlash
  BASEURL = (YAML.load_file("_config.yml")["baseurl"] || "").chomp("/")

  def service(request, response)
    if !BASEURL.empty? && request.path == BASEURL
      location = "#{BASEURL}/"
      location += "?#{request.query_string}" if request.query_string
      response.set_redirect(WEBrick::HTTPStatus::MovedPermanently, location)
    end
    super
  end
end

WEBrick::HTTPServer.prepend(ServeBaseurlSlash)
