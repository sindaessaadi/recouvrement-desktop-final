package tn.star.recouvrementbackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.star.recouvrementbackend.dto.LogActiviteResponse;
import tn.star.recouvrementbackend.service.LogActiviteService;

import java.util.List;

@RestController
@RequestMapping("/api/logs")
public class LogActiviteController {

    private final LogActiviteService logActiviteService;

    public LogActiviteController(LogActiviteService logActiviteService) {
        this.logActiviteService = logActiviteService;
    }

    @GetMapping
    public List<LogActiviteResponse> getAll() {
        return logActiviteService.getAll();
    }
}
