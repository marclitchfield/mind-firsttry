import express from "express";
import React from "react";
import { renderToString } from "react-dom/server";
import { match, RouterContext } from "react-router";
import Root from "../app/components/root";
import routes from "../app/routes";

const router = express.Router();
const RootFactory = React.createFactory(Root);

router.get("*", (request, response, next) => {
  match({ routes, location: request.url }, (error, redirectLocation, renderProps) => {
    if (error) { 
      return response.status(500).send(error.message); 
    }
    if (redirectLocation) {
      return response.redirect(302, redirectLocation.pathname + redirectLocation.search);
    }
    if (renderProps) {
      return renderRoute(response, next, renderProps);
    }
    response.status(404).send("Not found");
  });
});

function renderRoute(response, next, renderProps) {
  getRenderedMarkup(renderProps).then(({ markup, initialData }) => {
      response.render("index", {
        title: "Mind: Ideas",
        initialData: JSON.stringify(initialData),
        markup: markup
      });
  }).catch(err => next(err));
}

function getRenderedMarkup(renderProps) {
  const routeProps = getPropsFromRoute(renderProps, ['requestInitialData']);
  if (routeProps.requestInitialData) {
    return routeProps.requestInitialData().then(initialData => {
      const handleCreateElement = (Component, props) => (<Component initialData={initialData} {...props} />);
      const markup = renderToString(<RouterContext createElement={handleCreateElement} {...renderProps} />);
      return new Promise((resolve, reject) => resolve({ markup, initialData }));
    });
  }
  return new Promise((resolve, reject) => resolve({ 
    markup: renderToString(<RouterContext {...renderProps} />), 
    initialData: {} 
  }));
}

function getPropsFromRoute({routes}, componentProps) {
  let props = {};
  const lastRoute = routes[routes.length - 1];
  routes.reduceRight((prevRoute, currRoute) => {
    componentProps.forEach(componentProp => {
      if (!props[componentProp] && currRoute.component[componentProp]) {
        props[componentProp] = currRoute.component[componentProp];
      }
    });
  }, lastRoute);
  return props;
}

module.exports = router;
