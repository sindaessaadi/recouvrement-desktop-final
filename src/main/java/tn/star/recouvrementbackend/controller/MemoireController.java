package tn.star.recouvrementbackend.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.star.recouvrementbackend.dto.*;
import tn.star.recouvrementbackend.service.MemoireService;
import tn.star.recouvrementbackend.service.PaiementService;

import java.util.List;

@RestController
@RequestMapping("/api/memoires")
public class MemoireController {

    private final MemoireService memoireService;
    private final PaiementService paiementService;

    public MemoireController(MemoireService memoireService, PaiementService paiementService) {
        this.memoireService = memoireService;
        this.paiementService = paiementService;
    }

    @GetMapping
    public List<MemoireResponse> getAll() {
        return memoireService.getAll();
    }

    @GetMapping("/{id}")
    public MemoireResponse getById(@PathVariable Long id) {
        return memoireService.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MemoireResponse create(@Valid @RequestBody MemoireRequest request) {
        return memoireService.create(request);
    }

    @PutMapping("/{id}")
    public MemoireResponse update(@PathVariable Long id, @Valid @RequestBody MemoireRequest request) {
        return memoireService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        memoireService.delete(id);
    }

    @PutMapping("/{id}/echeanciers")
    public MemoireResponse setEcheanciers(@PathVariable Long id, @Valid @RequestBody List<EcheancierRequest> echeanciers) {
        return memoireService.setEcheanciers(id, echeanciers);
    }

    @PostMapping("/{id}/historique")
    public MemoireResponse addHistorique(@PathVariable Long id, @Valid @RequestBody HistoriqueStatutRequest request) {
        return memoireService.addHistorique(id, request);
    }

    @GetMapping("/{id}/paiements")
    public List<PaiementResponse> getPaiements(@PathVariable Long id) {
        return paiementService.getByMemoire(id);
    }

    @PostMapping("/{id}/paiements")
    @ResponseStatus(HttpStatus.CREATED)
    public PaiementResponse addPaiement(@PathVariable Long id, @Valid @RequestBody PaiementRequest request) {
        return paiementService.create(id, request);
    }
}
