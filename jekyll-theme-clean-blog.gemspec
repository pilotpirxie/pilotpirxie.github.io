# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "jekyll-simple-blog"
  spec.version       = "1.0.0"
  spec.authors       = ["pilotpirxie"]
  spec.email         = ["your-email@example.com"]

  spec.summary       = "A minimal blog theme with plain CSS."
  spec.homepage      = "https://pilotpirxie.github.io"
  spec.license       = "MIT"

  spec.files         = `git ls-files -z`.split("\x0").select { |f| f.match(%r{^(assets|_layouts|_includes|LICENSE|README)}i) }

  spec.add_runtime_dependency "jekyll", ">= 3.8.5"

  spec.add_development_dependency "bundler", "~> 2.0.1"
  spec.add_development_dependency "rake", "~> 12.0"
end
