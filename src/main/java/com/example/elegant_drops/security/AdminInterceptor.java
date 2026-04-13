package com.example.elegant_drops.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminInterceptor implements HandlerInterceptor {

    @Value("${admin.path}")
    private String adminPath;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String uri = request.getRequestURI();

        if (uri.startsWith("/" + adminPath) && !uri.endsWith("/login")) {
            if (request.getSession().getAttribute("adminLogged") == null) {
                response.sendRedirect("/" + adminPath + "/login");
                return false;
            }
        }
        return true;
    }
}