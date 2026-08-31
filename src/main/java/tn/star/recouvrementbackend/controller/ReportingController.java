package tn.star.recouvrementbackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.star.recouvrementbackend.dto.ReportingResponse;
import tn.star.recouvrementbackend.service.ReportingService;

@RestController
@RequestMapping("/api/reporting")
public class ReportingController {

    private final ReportingService reportingService;

    public ReportingController(ReportingService reportingService) {
        this.reportingService = reportingService;
    }

    @GetMapping
    public ReportingResponse getReporting() {
        return reportingService.getReporting();
    }
}
